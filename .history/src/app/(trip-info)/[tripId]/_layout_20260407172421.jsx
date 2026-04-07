import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { TripContext } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import { supabase } from "@/src/lib/supabase";
import DateUtils from "@/src/utils/DateUtils";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

// --- TEMPORARY CURRENT USER ---
const CURRENT_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; 

// ==========================================
// DATA FETCHING
// ==========================================

const fetchTripNotifications = async (tripId, userId) => {
    try {
        const notificationsList = [];

        const [walletResponse, ideasResponse, unscheduledResponse] = await Promise.all([
            // 1. Debts
            supabase.from('Expense_Splits')
                .select('amount_owed, Expenses!inner(expense_id, description, trip_id)')
                .eq('user_id', userId)
                .eq('Expenses.trip_id', tripId)
                .gt('amount_owed', 0),
            
            // 2. Ideas
            supabase.from('Events')
                .select('*', { count: 'exact', head: true })
                .eq('trip_id', tripId)
                .eq('status', 'Idea'),
            
            // 3. Unscheduled Events (Events that are NOT ideas, but lack a start time)
            supabase.from('Events')
                .select('*', { count: 'exact', head: true })
                .eq('trip_id', tripId)
                .neq('status', 'Idea') // Prevent double-counting items that are still just ideas
                .is('start_timestamp', null) 
        ]);

        // --- BUILD THE NOTIFICATIONS LIST ---

        if (walletResponse.data?.length > 0) {
            notificationsList.push({
                id: 'wallet_debt',
                type: 'wallet',
                title: 'Pending Debts',
                message: `You have ${walletResponse.data.length} unsettled expense(s).`,
                count: walletResponse.data.length
            });
        }

        if (ideasResponse.count > 0) {
            notificationsList.push({
                id: 'new_ideas',
                type: 'plan', // Ties into your Tab Bar name
                title: 'New Ideas to Explore',
                message: `There are ${ideasResponse.count} idea(s) on the board.`,
                count: ideasResponse.count
            });
        }
        
        if (unscheduledResponse.count > 0) {
            notificationsList.push({
                id: 'unscheduled_events',
                type: 'plan', // Ties into your Tab Bar name
                title: 'Ready to Schedule',
                message: `There are ${unscheduledResponse.count} event(s) ready to be scheduled.`,
                count: unscheduledResponse.count
            });
        }

        // Extract just the types for your TabBar badges (e.g., ['wallet', 'plan', 'plan'])
        // Using Set() removes duplicates so the 'plan' tab doesn't get two red dots
        const activeBadges = [...new Set(notificationsList.map(n => n.type))];

        return {
            list: notificationsList,     // Use this for UI banners/lists
            badges: activeBadges,        // Use this for the ReusableTabBar
            unscheduledCount: unscheduledResponse.count || 0
        };

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
                trip_id, trip_name, start_date, end_date, cover_photo_url, target_budget,
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
            const frontendEvent = { 
                ...event, 
                id: event.event_id,
                image_url: event.Photos?.photo_url || null 
            };

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
                event.event_votes?.forEach(v => {
                    votesObj[v.user_id] = v.vote_value === 1 ? 'yes' : 'no';
                });
                
                frontendEvent.votes = votesObj;
                frontendEvent.status = event.status === 'approved' ? 'approved' : 'voting'; 
                ideaBoard.push(frontendEvent);
            }
        });

        // ==========================================
        // TRIP READINESS: "COVERAGE" CALCULATION
        // ==========================================
        let readinessPercent = 0;
        if (trip.start_date && trip.end_date) {
            const start = new Date(trip.start_date);
            const end = new Date(trip.end_date);
            
            // Calculate total days (e.g., Friday to Sunday is 3 days, so + 1)
            const totalTripDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
            
            // Count how many unique days in the timeline have at least one event
            const plannedDays = Object.keys(timelineData).filter(date => timelineData[date].length > 0).length;
            
            // Cap at 100% just in case users add events outside official trip dates
            readinessPercent = Math.min(100, Math.round((plannedDays / totalTripDays) * 100));
        }

        const today = new Date();
        const startDate = new Date(trip.start_date);
        const takeoffDays = Math.max(0, Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
        const destinations = trip.Trip_Destinations?.map(td => td.cached_destinations).filter(Boolean) || [];
        const primaryDestination = destinations[0] || null;
        const destinationsStr = destinations.map(cd => `${cd.city}, ${cd.country}`).join(' & ') || 'TBD';
        const activeNotifications = await fetchTripNotifications(tripId, userId);
        console.log("Active notifications for trip:", activeNotifications);
        return {
            id: trip.trip_id,
            name: trip.trip_name,
            destination: destinationsStr,
            startDate: trip.start_date,
            endDate: trip.end_date,
            image: trip.cover_photo_url || primaryDestination?.cover_image_url,
            takeoffDays: takeoffDays,
            targetBudget: trip.target_budget,
            readinessPercent: readinessPercent, // Calculated dynamically!
            weather: { 
                temp: '--', 
                location: primaryDestination ? primaryDestination.city : 'TBD', 
                icon: 'wb-sunny',
                coordinates: primaryDestination ? { // ADDED for the overview.jsx API call!
                    latitude: primaryDestination.latitude,
                    longitude: primaryDestination.longitude
                } : null
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
    }
};

// ==========================================
// HELPER COMPONENTS
// ==========================================
const HeaderButton = ({ icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <BlurView
      intensity={10}
      tint="default"
      style={{
        width: 34,
        height: 34,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <MaterialIcons name={icon} size={moderateScale(22)} color="white" />
    </BlurView>
  </TouchableOpacity>
);

const CustomHeader = ({ trip }) => {
    const router = useRouter()
    const navigation = useNavigation();
    const goBack = () => {
        // 1. We don't need getParent() because CustomHeader is already at the Stack level!
        if (navigation.canGoBack()) {
            // Normal usage: Pop the trip off the stack safely
            navigation.goBack();
        } else {
            // Notification usage: No history exists! 
            router.replace('/'); 
        }
    };
    return (
    <View style={styles.headerContainer}>
        <Image source={trip.image} style={styles.gradient} contentFit='cover' cachePolicy='memory-disk' />
        <LinearGradient style={styles.gradient} colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.6)', 'rgba(0,0,0,0.8)']} locations={[0, 0.49, 0.78, 1]} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '5%', paddingTop: moderateScale(65) }}>
            <HeaderButton icon="arrow-back" onPress={() => goBack()}/>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                <HeaderButton icon="search" onPress={() => console.log('search')} />
                <HeaderButton icon="settings" onPress={() => router.navigate(`/(trip-info)/${trip.id}/settings`)} />
            </View>
        </View>
        
        <View style={ styles.contentWrapper }>
            <View style={ styles.spacer } />
            <View style={ styles.textContainer }>
                <Text style={ styles.destination }>{ trip.destination }</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
                    <MaterialIcons name="calendar-today" size={moderateScale(12)} color="white" />
                    <Text style={ styles.dateRange }>{ DateUtils.formatRange(DateUtils.parseYYYYMMDDToDate(trip.startDate), DateUtils.parseYYYYMMDDToDate(trip.endDate)) }</Text>
                </View>
            </View>
        </View>
        <TripInfoTabBar tripId={ trip.id }/>
    </View>
    );
};

// ==========================================
// MAIN LAYOUT COMPONENT
// ==========================================
export default function TripInfoLayout() {
    const { tripId } = useLocalSearchParams();
    const { user } = useAuth();
    // const userId = user?.id;
    const userId = CURRENT_USER_ID;


    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTripDashboard = async () => {
            if (!tripId) return;
            setIsLoading(true);
            const data = await fetchTripData(tripId, userId);
            setTripData(data);
            setIsLoading(false); 
        };
        loadTripDashboard();
    }, [tripId, userId]);

    // 1. DEFINE ALL ACTION HANDLERS FIRST
    const refreshTripData = async () => {
        const freshData = await fetchTripData(tripId, userId);
        if (freshData) setTripData(freshData);
    };

    const handleVote = async (ideaId, voteType) => {
        const previousState = tripData; 
        setTripData(prev => {
            const activeGroupSize = prev.group.filter(member => member.active).length;
            const requiredVotes = Math.floor(activeGroupSize / 2) + 1;
            const updatedIdeas = prev.ideaBoard.map(idea => {
                if (idea.id === ideaId) {
                    const newVotes = { ...(idea.votes || {}), [CURRENT_USER_ID]: voteType };
                    const yesCount = Object.values(newVotes).filter(v => v === 'yes').length;
                    return { ...idea, votes: newVotes, status: yesCount >= requiredVotes ? 'approved' : 'voting' };
                }
                return idea;
            });
            return { ...prev, ideaBoard: updatedIdeas };
        });

        try {
            const voteVal = voteType === 'yes' ? 1 : -1;
            await supabase.from('event_votes').delete().match({ event_id: ideaId, user_id: CURRENT_USER_ID });
            await supabase.from('event_votes').insert({ event_id: ideaId, user_id: CURRENT_USER_ID, vote_value: voteVal });

            const activeGroupSize = previousState.group.filter(member => member.active).length;
            const requiredVotes = Math.floor(activeGroupSize / 2) + 1;
            const votedIdea = previousState.ideaBoard.find(idea => idea.id === ideaId);
            const currentVotes = { ...(votedIdea?.votes || {}), [CURRENT_USER_ID]: voteType };
            const yesCount = Object.values(currentVotes).filter(v => v === 'yes').length;

            if (yesCount >= requiredVotes) {
                await supabase.from('Events').update({ status: 'approved' }).eq('event_id', ideaId);
            }
        } catch (error) {
            setTripData(previousState); 
            Alert.alert("Network Error", "Failed to save your vote.");
            console.error("Failed to save vote to database:", error);
        }
    };

    const addEventToBucket = async (date, event) => {
        const previousState = tripData;
        const newEventId = event.id || Date.now().toString();
        
        setTripData(prev => {
            const updatedIdeaBoard = prev.ideaBoard.map(idea => idea.id === event.id ? { ...idea, status: 'scheduled' } : idea);
            const newEvent = { ...event, id: newEventId, type: 'event', time: 'TBD' };
            return {
                ...prev,
                ideaBoard: updatedIdeaBoard,
                timelineData: { ...prev.timelineData, [date]: [...(prev.timelineData[date] || []), newEvent] }
            };
        });

        try {
            const startTimestamp = `${date}T09:00:00`; 
            await supabase.from('Events').update({ start_timestamp: startTimestamp, status: 'scheduled' }).eq('event_id', event.id);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to schedule event.");
            console.error("Failed to schedule event in database:", error);
        }
    };

    const updateDayEvents = (date, newlyOrderedData) => {
        setTripData(prev => ({ ...prev, timelineData: { ...prev.timelineData, [date]: newlyOrderedData } }));
    };

    const addCustomIdea = async (idea) => {
        try {
            let finalImageId = null;
            if (idea.imageUri) {
                const newPhotoRecord = await MediaUtils.uploadImageToSupabase(idea.imageUri, tripId, CURRENT_USER_ID, null, 'idea_board');
                finalImageId = newPhotoRecord.photo_id;
            }

            const { data: newEvent, error } = await supabase
                .from('Events')
                .insert({
                    trip_id: tripId, title: idea.title, category: idea.category,
                    description: idea.description, image_id: finalImageId, status: 'Idea'
                })
                .select()
                .single();

            if (error) throw error;

            await supabase.from('event_votes').insert({ event_id: newEvent.event_id, user_id: CURRENT_USER_ID, vote_value: 1 });
            refreshTripData();
        } catch (error) {
            console.error("Error saving custom idea:", error);
        }
    };

    const updateEventTime = async (eventId, dateStr, formattedTime) => {
        const previousState = tripData;
        setTripData(prev => {
            const updatedDayData = (prev.timelineData[dateStr] || []).map(item =>
                item.id === eventId ? { ...item, time: formattedTime } : item
            );
            return { ...prev, timelineData: { ...prev.timelineData, [dateStr]: updatedDayData } };
        });

        try {
            const [time, modifier] = formattedTime.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            
            const formattedHours = hours.toString().padStart(2, '0');
            const startTimestamp = `${dateStr}T${formattedHours}:${minutes}:00`;

            await supabase.from('Events').update({ start_timestamp: startTimestamp }).eq('event_id', eventId);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to update event time.");
            console.error("Failed to save time to DB:", error);
        }
    };

    const unassignEvent = async (eventId, dateStr) => {
        const previousState = tripData;
        setTripData(prev => ({
            ...prev,
            ideaBoard: prev.ideaBoard.map(idea => idea.id === eventId ? { ...idea, status: 'approved' } : idea),
            timelineData: { ...prev.timelineData, [dateStr]: (prev.timelineData[dateStr] || []).filter(e => e.id !== eventId) }
        }));

        try {
            await supabase.from('Events').update({ start_timestamp: null, status: 'approved' }).eq('event_id', eventId);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to unassign event.");
            console.error("Failed to unassign event:", error);
        }
    };

    const deleteEvent = async (eventId, dateStr) => {
        const previousState = tripData;
        setTripData(prev => ({
            ...prev,
            ideaBoard: prev.ideaBoard.filter(idea => idea.id !== eventId),
            timelineData: { ...prev.timelineData, [dateStr]: (prev.timelineData[dateStr] || []).filter(e => e.id !== eventId) }
        }));

        try {
            await supabase.from('event_votes').delete().eq('event_id', eventId);
            await supabase.from('Events').delete().eq('event_id', eventId);
        } catch (error) {
            setTripData(previousState);
            Alert.alert("Network Error", "Failed to delete event.");
            console.error("Failed to delete event:", error);
        }
    };

    const deleteStay = (stayId) => { /* Keep existing */ }
    const addTransaction = (payload) => { /* Keep existing */ }
    const addSettlement = (payload) => { /* Keep existing */ }

    // 2. SAFELY DERIVE DATA USING OPTIONAL CHAINING
    const ideaBoard = tripData?.ideaBoard || [];
    const discoverFeed = ideaBoard.filter(idea => (idea.votes || {})[CURRENT_USER_ID] === undefined && idea.status !== 'approved');
    const inProgressFeed = ideaBoard.filter(idea => (idea.votes || {})[CURRENT_USER_ID] === 'yes' && idea.status !== 'approved' && idea.status !== 'scheduled');
    const unassignedIdeas = ideaBoard.filter(idea => idea.status === 'approved');

    // 3. RUN useMemo BEFORE EARLY RETURN
    const contextValue = useMemo(() => {
        if (!tripData) return {}; // Failsafe fallback
        
        return {
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
        };
    }, [tripId, tripData, discoverFeed, inProgressFeed, unassignedIdeas]);

    // 4. NOW DO THE EARLY RETURN FOR LOADING
    if (isLoading || !tripData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // 5. MAIN RENDER
    return (
        <TripContext.Provider value={contextValue}>
            <StatusBar style="light" /> 
            <View style={{ flex: 1 }}>
                <CustomHeader trip={tripData} />
                <Tabs screenOptions={{ tabBarStyle: { display: "none" }, headerShown: false, unmountOnBlur: true }}>
                    <Tabs.Screen name="overview" options={{ title: "Overview" }} />
                    <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
                    <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
                    <Tabs.Screen name="docs" options={{ title: "Docs" }} />
                    <Tabs.Screen name="memories" options={{ title: "Memories" }} />
                    <Tabs.Screen name="album" options={{ headerShown: false }} />
                    <Tabs.Screen name="chat" options={{ title: "Chat" }} />
                </Tabs>
            </View>
        </TripContext.Provider>
    );
  }

const styles = StyleSheet.create({
    headerContainer: { height: '39%' },
    imageBackground: { flex: 1 },
    gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    contentWrapper: { flex: 1, paddingHorizontal: '5%', paddingTop: moderateScale(40), paddingBottom: moderateScale(28) },
    spacer: { flex: 1 },
    textContainer: { gap: 4 },
    destination: { color: 'white', fontSize: moderateScale(25), fontWeight: 'bold', maxWidth: '60%' },
    dateRange: { color: 'white', fontSize: moderateScale(12), marginTop: 4 },
});
