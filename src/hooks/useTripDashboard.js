import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

// --- TEMPORARY CURRENT USER ---
const CURRENT_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad';

// ==========================================
// DATA FETCHING
// ==========================================

const fetchTripNotifications = async (tripId, userId) => {
    try {
        const notificationsList = [];

        const [walletResponse, ideasResponse, unscheduledResponse] = await Promise.all([
            supabase.from('Expense_Splits')
                .select('amount_owed, Expenses!inner(expense_id, description, trip_id)')
                .eq('user_id', userId)
                .eq('Expenses.trip_id', tripId)
                .gt('amount_owed', 0),
            supabase.from('Events')
                .select('*', { count: 'exact', head: true })
                .eq('trip_id', tripId)
                .eq('status', 'Idea'),
            supabase.from('Events')
                .select('*', { count: 'exact', head: true })
                .eq('trip_id', tripId)
                .neq('status', 'Idea')
                .is('start_timestamp', null)
        ]);

        if (walletResponse.data?.length > 0) {
            notificationsList.push({ id: 'wallet_debt', type: 'wallet', title: 'Pending Debts', message: `You have ${walletResponse.data.length} unsettled expense(s).`, count: walletResponse.data.length });
        }
        if (ideasResponse.count > 0) {
            notificationsList.push({ id: 'new_ideas', type: 'plan', title: 'New Ideas to Explore', message: `There are ${ideasResponse.count} idea(s) on the board.`, count: ideasResponse.count });
        }
        if (unscheduledResponse.count > 0) {
            notificationsList.push({ id: 'unscheduled_events', type: 'plan', title: 'Ready to Schedule', message: `There are ${unscheduledResponse.count} event(s) ready to be scheduled.`, count: unscheduledResponse.count });
        }

        const activeBadges = [...new Set(notificationsList.map(n => n.type))];
        return { list: notificationsList, badges: activeBadges, unscheduledCount: unscheduledResponse.count || 0 };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { list: [], badges: [], unscheduledCount: 0 };
    }
};

const fetchTripData = async (tripId, userId) => {
    if (!tripId) return null;

    try {
        const { data: trip, error } = await supabase
            .from('Trips')
            .select(`
                trip_id, trip_name, start_date, end_date, cover_photo_url, target_budget, default_currency,
                Trip_Destinations ( cached_destinations ( city, country, cover_image_url, longitude, latitude ) ),
                Trip_Members ( user_id, role, Users ( first_name, last_name, avatar_url ) )
            `)
            .eq('trip_id', tripId)
            .maybeSingle();

        if (error) throw error;
        if (!trip) return null;

        const { data: eventsData, error: eventsError } = await supabase
            .from('Events')
            .select('*, event_votes(user_id, vote_value), Photos(photo_id, photo_url)')
            .eq('trip_id', tripId);

        if (eventsError) throw eventsError;

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
                h = h % 12 || 12;
                frontendEvent.time = `${h}:${m} ${ampm}`;
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

        let readinessPercent = 0;
        if (trip.start_date && trip.end_date) {
            const start = new Date(trip.start_date);
            const end = new Date(trip.end_date);
            const totalTripDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
            const plannedDays = Object.keys(timelineData).filter(date => timelineData[date].length > 0).length;
            readinessPercent = Math.min(100, Math.round((plannedDays / totalTripDays) * 100));
        }

        const today = new Date();
        const startDate = new Date(trip.start_date);
        const takeoffDays = Math.max(0, Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
        const destinations = trip.Trip_Destinations?.map(td => td.cached_destinations).filter(Boolean) || [];
        const primaryDestination = destinations[0] || null;
        const destinationsStr = destinations.map(cd => `${cd.city}, ${cd.country}`).join(' & ') || 'TBD';
        const activeNotifications = await fetchTripNotifications(tripId, userId);

        return {
            id: trip.trip_id,
            name: trip.trip_name,
            destination: destinationsStr,
            startDate: trip.start_date,
            endDate: trip.end_date,
            image: trip.cover_photo_url || primaryDestination?.cover_image_url,
            takeoffDays: takeoffDays,
            targetBudget: trip.target_budget,
            defaultCurrency: trip.default_currency || 'USD',
            readinessPercent: readinessPercent,
            weather: {
                temp: '--',
                location: primaryDestination ? primaryDestination.city : 'TBD',
                icon: 'wb-sunny',
                coordinates: primaryDestination ? { latitude: primaryDestination.latitude, longitude: primaryDestination.longitude } : null
            },
            notifications: activeNotifications,
            notificationList: activeNotifications.list,
            ideaBoard,
            timelineData,
            group: trip.Trip_Members?.map((member, index) => {
                const user = member.Users;
                return {
                    id: member.user_id,
                    name: `${user?.first_name || 'U'} ${user?.last_name?.charAt(0) || ''}.`,
                    initials: `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`,
                    profileColor: ['#1E90FF', '#32CD32', '#FFA500', '#FF4500', '#8A2BE2'][index % 5],
                    profilePic: user?.avatar_url,
                    active: member.user_id === userId,
                    role: member.role
                };
            }) || []
        };
    } catch (err) {
        console.error("Error fetching core trip data:", err);
        return null;
    }
};

export function useTripDashboard() {
    const { tripId } = useLocalSearchParams();
    const { user } = useAuth();
    const userId = user?.id || CURRENT_USER_ID;


    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadTripDashboard = useCallback(async () => {
        if (!tripId) return;
        setIsLoading(true);
        const data = await fetchTripData(tripId, userId);
        setTripData(data);
        setIsLoading(false);
    }, [tripId, userId]);

    useEffect(() => {
        loadTripDashboard();
    }, [loadTripDashboard]);

    const refreshTripData = useCallback(async () => {
        const freshData = await fetchTripData(tripId, userId);
        if (freshData) setTripData(freshData);
    }, [tripId, userId]);

    const handleVote = useCallback(async (ideaId, voteType) => {
        const previousState = tripData;
        setTripData(prev => {
            const activeGroupSize = prev.group.filter(member => member.active).length;
            const requiredVotes = Math.floor(activeGroupSize / 2) + 1;
            const updatedIdeas = prev.ideaBoard.map(idea => {
                if (idea.id === ideaId) {
                    const newVotes = { ...(idea.votes || {}), [userId]: voteType };
                    const yesCount = Object.values(newVotes).filter(v => v === 'yes').length;
                    return { ...idea, votes: newVotes, status: yesCount >= requiredVotes ? 'approved' : 'voting' };
                }
                return idea;
            });
            return { ...prev, ideaBoard: updatedIdeas };
        });

        try {
            const voteVal = voteType === 'yes' ? 1 : -1;
            await supabase.from('event_votes').delete().match({ event_id: ideaId, user_id: userId });
            await supabase.from('event_votes').insert({ event_id: ideaId, user_id: userId, vote_value: voteVal });

            const activeGroupSize = previousState.group.filter(member => member.active).length;
            const requiredVotes = Math.floor(activeGroupSize / 2) + 1;
            const votedIdea = previousState.ideaBoard.find(idea => idea.id === ideaId);
            const currentVotes = { ...(votedIdea?.votes || {}), [userId]: voteType };
            const yesCount = Object.values(currentVotes).filter(v => v === 'yes').length;

            if (yesCount >= requiredVotes) {
                await supabase.from('Events').update({ status: 'approved' }).eq('event_id', ideaId);
            }
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to save your vote.");
            console.error("Failed to save vote to database:", error);
        }
    }, [tripData, userId]);

    const addEventToBucket = useCallback(async (date, event) => {
        const previousState = tripData;
        const newEventId = event.id || Date.now().toString();

        setTripData(prev => {
            const updatedIdeaBoard = prev.ideaBoard.map(idea => idea.id === event.id ? { ...idea, status: 'scheduled' } : idea);
            const newEvent = { ...event, id: newEventId, type: 'event', time: 'TBD' };
            return { ...prev, ideaBoard: updatedIdeaBoard, timelineData: { ...prev.timelineData, [date]: [...(prev.timelineData[date] || []), newEvent] } };
        });

        try {
            await supabase.from('Events').update({ start_timestamp: `${date}T09:00:00`, status: 'scheduled' }).eq('event_id', event.id);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to schedule event.");
            console.error("Failed to schedule event in database:", error);
        }
    }, [tripData]);

    const addCustomIdea = useCallback(async (idea) => {
        try {
            let finalImageId = null;
            if (idea.imageUri) {
                const newPhotoRecord = await MediaUtils.uploadImageToSupabase(idea.imageUri, tripId, userId, null, 'idea_board');
                finalImageId = newPhotoRecord.photo_id;
            }
            const { data: newEvent, error } = await supabase.from('Events').insert({ trip_id: tripId, title: idea.title, category: idea.category, description: idea.description, image_id: finalImageId, status: 'Idea' }).select().single();
            if (error) throw error;
            await supabase.from('event_votes').insert({ event_id: newEvent.event_id, user_id: userId, vote_value: 1 });
            refreshTripData();
        } catch (error) {
            console.error("Error saving custom idea:", error);
        }
    }, [tripId, userId, refreshTripData]);

    const updateEventTime = useCallback(async (eventId, dateStr, formattedTime) => {
        const previousState = tripData;
        setTripData(prev => {
            const updatedDayData = (prev.timelineData[dateStr] || []).map(item => item.id === eventId ? { ...item, time: formattedTime } : item);
            return { ...prev, timelineData: { ...prev.timelineData, [dateStr]: updatedDayData } };
        });

        try {
            const [time, modifier] = formattedTime.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            const startTimestamp = `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes}:00`;
            await supabase.from('Events').update({ start_timestamp: startTimestamp }).eq('event_id', eventId);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to update event time.");
            console.error("Failed to save time to DB:", error);
        }
    }, [tripData]);

    const unassignEvent = useCallback(async (eventId, dateStr) => {
        const previousState = tripData;
        setTripData(prev => ({ ...prev, ideaBoard: prev.ideaBoard.map(idea => idea.id === eventId ? { ...idea, status: 'approved' } : idea), timelineData: { ...prev.timelineData, [dateStr]: (prev.timelineData[dateStr] || []).filter(e => e.id !== eventId) } }));
        try {
            await supabase.from('Events').update({ start_timestamp: null, status: 'approved' }).eq('event_id', eventId);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to unassign event.");
            console.error("Failed to unassign event:", error);
        }
    }, [tripData]);

    const deleteEvent = useCallback(async (eventId, dateStr) => {
        const previousState = tripData;
        setTripData(prev => ({ ...prev, ideaBoard: prev.ideaBoard.filter(idea => idea.id !== eventId), timelineData: { ...prev.timelineData, [dateStr]: (prev.timelineData[dateStr] || []).filter(e => e.id !== eventId) } }));
        try {
            await supabase.from('event_votes').delete().eq('event_id', eventId);
            await supabase.from('Events').delete().eq('event_id', eventId);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to delete event.");
            console.error("Failed to delete event:", error);
        }
    }, [tripData]);

    const updateEventDetails = useCallback((updatedEvent, dateStr) => {
        setTripData(prev => {
            if (!prev.timelineData[dateStr]) {
                console.warn(`Date string ${dateStr} not found in timelineData for event update.`);
                return prev;
            }
            const updatedDayData = prev.timelineData[dateStr].map(event => event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event);
            return { ...prev, timelineData: { ...prev.timelineData, [dateStr]: updatedDayData } };
        });
    }, []);

    const updateDayEvents = useCallback((date, newlyOrderedData) => {
        setTripData(prev => ({ ...prev, timelineData: { ...prev.timelineData, [date]: newlyOrderedData } }));
    }, []);

    const updateTripField = useCallback((key, value) => {
        setTripData(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateTripContext = useCallback((newData) => {
        setTripData((prevData) => ({ ...prevData, ...newData }));
    }, []);

    const ideaBoard = useMemo(() => tripData?.ideaBoard || [], [tripData?.ideaBoard]);
    const discoverFeed = useMemo(() => ideaBoard.filter(idea => (idea.votes || {})[userId] === undefined && idea.status !== 'approved'), [ideaBoard, userId]);
    const inProgressFeed = useMemo(() => ideaBoard.filter(idea => (idea.votes || {})[userId] === 'yes' && idea.status !== 'approved' && idea.status !== 'scheduled'), [ideaBoard, userId]);
    const unassignedIdeas = useMemo(() => ideaBoard.filter(idea => idea.status === 'approved'), [ideaBoard]);

    const deleteStay = (stayId) => { /* Stub */ };
    const addTransaction = (payload) => { /* Stub */ };
    const addSettlement = (payload) => { /* Stub */ };

    return {
        isLoading,
        tripId,
        ...tripData,
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
        deleteStay,
        addTransaction,
        addSettlement,
        updateTripField,
        updateEventDetails,
        updateTripContext
    };
}