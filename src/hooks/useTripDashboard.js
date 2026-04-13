import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { fetchDocumentsAPI } from "./useDocsData";
import { fetchMemoryDataAPI } from "./useMemoryData";
import { fetchWalletDataAPI } from "./useWalletData";

// ==========================================
// HELPER: Fetch Notifications
// ==========================================
const fetchTripNotifications = async (tripId, userId) => {
    try {
        const notificationsList = [];
        const [walletResponse, ideasResponse, unscheduledResponse] = await Promise.all([
            supabase.from('Expense_Splits').select('amount_owed, Expenses!inner(expense_id, description, trip_id)').eq('user_id', userId).eq('Expenses.trip_id', tripId).gt('amount_owed', 0),
            supabase.from('Events').select('*', { count: 'exact', head: true }).eq('trip_id', tripId).eq('status', 'Idea'),
            supabase.from('Events').select('*', { count: 'exact', head: true }).eq('trip_id', tripId).neq('status', 'Idea').is('start_timestamp', null)
        ]);

        if (walletResponse.data?.length > 0) notificationsList.push({ id: 'wallet_debt', type: 'wallet', title: 'Pending Debts', message: `You have ${walletResponse.data.length} unsettled expense(s).`, count: walletResponse.data.length });
        if (ideasResponse.count > 0) notificationsList.push({ id: 'new_ideas', type: 'plan', title: 'New Ideas to Explore', message: `There are ${ideasResponse.count} idea(s) on the board.`, count: ideasResponse.count });
        if (unscheduledResponse.count > 0) notificationsList.push({ id: 'unscheduled_events', type: 'plan', title: 'Ready to Schedule', message: `There are ${unscheduledResponse.count} event(s) ready to be scheduled.`, count: unscheduledResponse.count });

        return { list: notificationsList, badges: [...new Set(notificationsList.map(n => n.type))], unscheduledCount: unscheduledResponse.count || 0 };
    } catch (error) {
        return { list: [], badges: [], unscheduledCount: 0 };
    }
};

export function useTripDashboard() {
    const { tripId } = useLocalSearchParams();
    const { user } = useAuth();
    const userId = user?.id;
    const queryClient = useQueryClient();



    // ==========================================
    // 1. QUERY: Background Fetching & Caching
    // ==========================================
    const { data: tripData, isLoading, refetch: refreshTripData } = useQuery({
        queryKey: ['tripDashboard', tripId],
        queryFn: async () => {
            if (!tripId || !userId) return null;
            
            const { data: trip, error } = await supabase.from('Trips').select(`
                trip_id, trip_name, start_date, end_date, cover_photo_url, target_budget, default_currency,
                Trip_Destinations ( cached_destinations ( city, country, country_code, cover_image_url, longitude, latitude ) ),
                Trip_Members ( user_id, role, Users ( first_name, last_name, avatar_url ) )
            `).eq('trip_id', tripId).maybeSingle();

            if (error || !trip) throw error;

            const { data: eventsData } = await supabase.from('Events').select('*, event_votes(user_id, vote_value), Photos(photo_id, photo_url)').eq('trip_id', tripId);
            
            const ideaBoard = [];
            const timelineData = {};

            eventsData?.forEach(event => {
                const frontendEvent = { ...event, id: event.event_id, image_url: event.Photos?.photo_url || null };
                if (event.start_timestamp) {
                    const dateStr = event.start_timestamp.split('T')[0];
                    if (!timelineData[dateStr]) timelineData[dateStr] = [];
                    const timePart = event.start_timestamp.split('T')[1].substring(0, 5);
                    let [h, m] = timePart.split(':');
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    frontendEvent.time = `${h % 12 || 12}:${m} ${ampm}`;
                    frontendEvent.type = 'event';
                    timelineData[dateStr].push(frontendEvent);
                } else {
                    const votesObj = {};
                    event.event_votes?.forEach(v => { votesObj[v.user_id] = v.vote_value === 1 ? 'yes' : 'no'; });
                    frontendEvent.votes = votesObj;
                    frontendEvent.status = event.status === 'approved' ? 'approved' : 'voting';
                    ideaBoard.push(frontendEvent);
                }
            });

            const start = new Date(trip.start_date);
            const totalTripDays = trip.end_date ? Math.max(1, Math.ceil((new Date(trip.end_date) - start) / 86400000) + 1) : 1;
            const plannedDays = Object.keys(timelineData).filter(date => timelineData[date].length > 0).length;
            const destinations = trip.Trip_Destinations?.map(td => td.cached_destinations).filter(Boolean) || [];
            const primaryDestination = destinations[0] || null;
            const activeNotifications = await fetchTripNotifications(tripId, userId);

            return {
                id: trip.trip_id,
                name: trip.trip_name,
                destination: destinations,
                startDate: trip.start_date,
                endDate: trip.end_date,
                image: trip.cover_photo_url || primaryDestination?.cover_image_url,
                takeoffDays: Math.max(0, Math.ceil((start - new Date()) / 86400000)),
                targetBudget: trip.target_budget,
                defaultCurrency: trip.default_currency || 'USD',
                readinessPercent: Math.min(100, Math.round((plannedDays / totalTripDays) * 100)),
                weather: { temp: '--', location: primaryDestination?.city || 'TBD', icon: 'wb-sunny', coordinates: primaryDestination ? { latitude: primaryDestination.latitude, longitude: primaryDestination.longitude } : null },
                notifications: activeNotifications,
                notificationList: activeNotifications.list,
                ideaBoard,
                timelineData,
                group: trip.Trip_Members?.map((m, i) => ({
                    id: m.user_id, name: `${m.Users?.first_name || 'U'} ${m.Users?.last_name?.charAt(0) || ''}.`,
                    initials: `${m.Users?.first_name?.charAt(0) || ''}${m.Users?.last_name?.charAt(0) || ''}`,
                    profileColor: ['#1E90FF', '#32CD32', '#FFA500', '#FF4500', '#8A2BE2'][i % 5], profilePic: m.Users?.avatar_url, active: m.user_id === userId, role: m.role
                })) || []
            };
        },
        enabled: !!tripId && !!userId,
        // 🌟 MAGIC SAUCE: Serve cached data instantly, fetch silently in background if older than 5 mins
        staleTime: 1000 * 60 * 5, 
    });

    // 2. 🔥 THE PREFETCH BLOCK 🔥
    useEffect(() => {
        if (!tripId || !userId) return;

        // Prefetch Wallet Data
        queryClient.prefetchQuery({
            queryKey: ['wallet', tripId], // MUST exactly match the key in useWalletData!
            queryFn: () => fetchWalletDataAPI(tripId, userId),
            staleTime: 1000 * 60 * 5, // Keep it in cache for 5 minutes
        });

        // Prefetch Memory/Photos Data
        queryClient.prefetchQuery({
            queryKey: ['documents', tripId], // MUST exactly match the key in useMemoryData!
            queryFn: () => fetchDocumentsAPI(tripId),
            staleTime: 1000 * 60 * 5,
        });

        // Prefetch Memory/Photos Data
        queryClient.prefetchQuery({
            queryKey: ['memories', tripId], // MUST exactly match the key in useMemoryData!
            queryFn: () => fetchMemoryDataAPI(tripId),
            staleTime: 1000 * 60 * 5,
        });

    }, [tripId, userId, queryClient]); // Runs once when the dashboard loads

    const setTripData = useCallback((updater) => {
        queryClient.setQueryData(['tripDashboard', tripId], (old) => typeof updater === 'function' ? updater(old || {}) : { ...(old || {}), ...updater });
    }, [queryClient, tripId]);

    // ==========================================
    // 2. MUTATIONS: Flawless Optimistic Updates
    // ==========================================
    
    const voteMutation = useMutation({
        onMutate: async ({ ideaId, voteType }) => {
            await queryClient.cancelQueries(['tripDashboard', tripId]); // Stop background fetches from overwriting us
            const previousState = queryClient.getQueryData(['tripDashboard', tripId]);
            
            // Optimistic Update
            setTripData(prev => {
                const requiredVotes = Math.floor(prev.group.filter(m => m.active).length / 2) + 1;
                return {
                    ...prev, ideaBoard: prev.ideaBoard.map(idea => {
                        if (idea.id === ideaId) {
                            const newVotes = { ...(idea.votes || {}), [userId]: voteType };
                            return { ...idea, votes: newVotes, status: Object.values(newVotes).filter(v => v === 'yes').length >= requiredVotes ? 'approved' : 'voting' };
                        }
                        return idea;
                    })
                };
            });
            return { previousState }; // Pass to onError if it fails
        },
        mutationFn: async ({ ideaId, voteType }) => {
            const voteVal = voteType === 'yes' ? 1 : -1;
            await supabase.from('event_votes').delete().match({ event_id: ideaId, user_id: userId });
            await supabase.from('event_votes').insert({ event_id: ideaId, user_id: userId, vote_value: voteVal });

            // Check if we need to officially approve it in DB
            const state = queryClient.getQueryData(['tripDashboard', tripId]);
            const idea = state.ideaBoard.find(i => i.id === ideaId);
            if (idea && idea.status === 'approved') {
                await supabase.from('Events').update({ status: 'approved' }).eq('event_id', ideaId);
            }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['tripDashboard', tripId], context.previousState); // Rollback!
            Alert.alert("Network Error", "Failed to save your vote.");
        },
        onSettled: () => queryClient.invalidateQueries(['tripDashboard', tripId]) // Sync cleanly after
    });

    const scheduleMutation = useMutation({
        onMutate: async ({ date, event }) => {
            await queryClient.cancelQueries(['tripDashboard', tripId]);
            const previousState = queryClient.getQueryData(['tripDashboard', tripId]);
            
            setTripData(prev => ({
                ...prev, 
                ideaBoard: prev.ideaBoard.map(i => i.id === event.id ? { ...i, status: 'scheduled' } : i),
                timelineData: { ...prev.timelineData, [date]: [...(prev.timelineData[date] || []), { ...event, id: event.id || Date.now().toString(), type: 'event', time: 'TBD' }] }
            }));
            return { previousState };
        },
        mutationFn: async ({ date, event }) => {
            await supabase.from('Events').update({ start_timestamp: `${date}T09:00:00`, status: 'scheduled' }).eq('event_id', event.id);
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(['tripDashboard', tripId], context.previousState);
            Alert.alert("Error", "Failed to schedule event.");
        }
    });

    const deleteEventMutation = useMutation({
        onMutate: async ({ eventId, dateStr }) => {
            await queryClient.cancelQueries(['tripDashboard', tripId]);
            const previousState = queryClient.getQueryData(['tripDashboard', tripId]);
            
            setTripData(prev => ({ 
                ...prev, 
                ideaBoard: prev.ideaBoard.filter(i => i.id !== eventId), 
                timelineData: dateStr ? { ...prev.timelineData, [dateStr]: (prev.timelineData[dateStr] || []).filter(e => e.id !== eventId) } : prev.timelineData 
            }));
            return { previousState };
        },
        mutationFn: async ({ eventId }) => {
            await supabase.from('event_votes').delete().eq('event_id', eventId);
            await supabase.from('Events').delete().eq('event_id', eventId);
        },
        onError: (err, vars, context) => queryClient.setQueryData(['tripDashboard', tripId], context.previousState)
    });

    const unassignMutation = useMutation({
        onMutate: async ({ eventId, dateStr }) => {
            await queryClient.cancelQueries(['tripDashboard', tripId]);
            const previousState = queryClient.getQueryData(['tripDashboard', tripId]);
            const eventToMove = previousState.timelineData?.[dateStr]?.find(e => e.id === eventId);
            
            if (eventToMove) {
                setTripData(prev => ({
                    ...prev,
                    ideaBoard: prev.ideaBoard.some(i => i.id === eventId) 
                        ? prev.ideaBoard.map(i => i.id === eventId ? { ...i, status: 'approved', start_timestamp: null } : i)
                        : [...prev.ideaBoard, { ...eventToMove, status: 'approved', start_timestamp: null }],
                    timelineData: { ...prev.timelineData, [dateStr]: prev.timelineData[dateStr].filter(e => e.id !== eventId) }
                }));
            }
            return { previousState };
        },
        mutationFn: async ({ eventId }) => {
            await supabase.from('Events').update({ start_timestamp: null, status: 'approved' }).eq('event_id', eventId);
        },
        onError: (err, vars, context) => queryClient.setQueryData(['tripDashboard', tripId], context.previousState)
    });

    const addCustomIdeaMutation = useMutation({
        mutationFn: async (idea) => {
            let finalImageId = null;
            if (idea.imageUri) {
                const photo = await MediaUtils.uploadImageToSupabase(idea.imageUri, tripId, userId, null, 'idea_board');
                finalImageId = photo.photo_id;
            }
            const { data } = await supabase.from('Events').insert({ trip_id: tripId, title: idea.title, category: idea.category, description: idea.description, image_id: finalImageId, status: 'Idea' }).select().single();
            await supabase.from('event_votes').insert({ event_id: data.event_id, user_id: userId, vote_value: 1 });
        },
        onSuccess: () => queryClient.invalidateQueries(['tripDashboard', tripId])
    });

    // ==========================================
    // 3. DERIVED STATE & ACTIONS
    // ==========================================
    const ideaBoard = useMemo(() => tripData?.ideaBoard || [], [tripData?.ideaBoard]);
    const discoverFeed = useMemo(() => ideaBoard.filter(idea => (idea.votes || {})[userId] === undefined && idea.status !== 'approved'), [ideaBoard, userId]);
    const inProgressFeed = useMemo(() => ideaBoard.filter(idea => (idea.votes || {})[userId] === 'yes' && idea.status !== 'approved' && idea.status !== 'scheduled'), [ideaBoard, userId]);
    const unassignedIdeas = useMemo(() => ideaBoard.filter(idea => idea.status === 'approved'), [ideaBoard]);

    // These simply trigger the mutations we defined above, keeping your UI code identical!
    const handleVote = (ideaId, voteType) => voteMutation.mutate({ ideaId, voteType });
    const addEventToBucket = (date, event) => scheduleMutation.mutate({ date, event });
    const addCustomIdea = (idea) => addCustomIdeaMutation.mutate(idea);
    const deleteEvent = (eventId, dateStr) => deleteEventMutation.mutate({ eventId, dateStr });
    const unassignEvent = (eventId, dateStr) => unassignMutation.mutate({ eventId, dateStr });

    // Drag and Drop (No DB hit required until save)
    const updateDayEvents = useCallback((date, orderedData) => setTripData(prev => ({ ...prev, timelineData: { ...prev.timelineData, [date]: orderedData } })), [setTripData]);
    const updateEventDetails = useCallback((updatedEvent, dateStr) => setTripData(prev => ({ ...prev, timelineData: { ...prev.timelineData, [dateStr]: prev.timelineData[dateStr]?.map(e => e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e) }})), [setTripData]);

    const updateEventTime = async (eventId, dateStr, formattedTime) => {
        // Leaving this one as a standard async for simplicity, but proxy updates local state!
        setTripData(prev => ({ ...prev, timelineData: { ...prev.timelineData, [dateStr]: (prev.timelineData[dateStr] || []).map(item => item.id === eventId ? { ...item, time: formattedTime } : item) } }));
        const [time, modifier] = formattedTime.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        await supabase.from('Events').update({ start_timestamp: `${dateStr}T${hours.padStart(2, '0')}:${minutes}:00` }).eq('event_id', eventId);
    };

    return {
        isLoading, // True ONLY on first ever load. Future visits use cache!
        tripId,
        ...(tripData || {}), 
        discoverFeed,
        inProgressFeed,
        unassignedIdeas,
        refreshTripData,
        handleVote,
        addEventToBucket,
        updateDayEvents,
        addCustomIdea,
        updateEventTime,
        unassignEvent,
        deleteEvent,
        updateEventDetails
    };
}