import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { TripContext } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// --- Global Trip Mock Data ---
// --- Global Trip Mock Data ---
const MOCK_TRIP_DATA = {
    'trip-123': {
        id: 'trip-123',
        name: 'Japan 2026', 
        takeoffDays: 12,
        destination: 'Kyoto, Japan',
        startDate: '2024-10-12',
        endDate: '2024-10-24',
        image: require('../../../../assets/images/Kyoto.jpg'),
        weather: { temp: 72, location: 'Tokyo, JP', icon: 'wb-sunny' },
        readinessPercent: 60,
        notifications: [
            { id: 1, title: "2 Decisions Pending", description: "Welcome Dinner, Museum Day", icon: "mail", color: Colors.primary, lightColor: Colors.primaryLight },
            { id: 2, title: "Settle Debts", description: "You owe Hunter $45", icon: "payments", color: Colors.danger, lightColor: Colors.dangerLight },
        ],
        group: [
            { id: 1, name: "Alice B.", initials: "AB", profileColor: '#1E90FF', profilePic: null, active: false },
            { id: 2, name: "Hunter S.", initials: "HS", profileColor: '#32CD32', profilePic: null, active: true },
            { id: 3, name: "Maria K.", initials: "MK", profileColor: '#FFA500', profilePic: null, active: true },
        ],
        budgetData: { totalSpent: 1240.50, totalBudget: 3200.00 },
        groupBalances: [
            { id: 1, name: 'Hunter', balance: 45.00, avatar: 'https://i.pravatar.cc/150?u=hunter' },
            { id: 2, name: 'Ashley', balance: 75.00, avatar: 'https://i.pravatar.cc/150?u=ashley' },
            { id: 3, name: 'Sarah', balance: -24.50, avatar: 'https://i.pravatar.cc/150?u=sarah' },
        ],
        transactions: [
            { id: 1, title: 'Sushi Dinner', payer: 'You', split: 'Split equally', amount: 128.50, icon: 'food-fork-drink' },
            { id: 2, title: 'Uber to Hotel', payer: 'Hunter', split: 'Split equally', amount: 24.50, icon: 'car' },
        ],
        timelineData: {
            '2023-10-12': [
                { id: '1', time: '9:00 AM', title: 'Meiji Shrine', category: 'Culture', type: 'event' },
                { id: '2', time: '12:30 PM', title: 'Ichiran Ramen', category: 'Lunch Reservation', type: 'event' },
                { id: '3', time: '4:30 PM', title: 'Tokyo Skytree', category: 'Sightseeing', type: 'event' },
            ],
            '2023-10-13': [
                { id: '5', time: '10:00 AM', title: 'Shinjuku Gyoen National Garden', category: 'Nature', type: 'event' },
                { id: '6', time: '1:00 PM', title: 'Shibuya Crossing', category: 'Sightseeing', type: 'event' },
            ]
        },
        staysData: [
            {
                id: '1',
                name: 'Ryokan Yamazaki',
                address: '11-1 Hirano Miyamotocho, Kita Ward, Kyoto',
                checkIn: '10/20 2:00 PM',
                checkOut: '10/24 12:00 PM',
            },
            {
                id: '2',
                name: 'Park Hyatt Tokyo',
                address: '3-7-1-2 Nishi-Shinjuku, Shinjuku-Ku, Tokyo',
                checkIn: '10/24 3:00 PM',
                checkOut: '10/28 11:00 AM',
            },
        ],
        documents: [
            { id: '1', title: "Passport_Scan.pdf", date: "2023-06-01", size: "2.4 MB" },
            { id: '2', title: "Visa_Japan.pdf", date: "2023-06-02", size: "1.8 MB" },
            { id: '3', title: "Flight_Confirmation.pdf", date: "2023-06-03", size: "0.9 MB" },
        ],
        ideaBoard: [
            { id: '1', title: 'Omoide Yokocho', description: 'Narrow alley packed with yakitori joints. Great for evening.', image: require('../../../../assets/images/Kyoto.jpg') },
            { id: '2', title: 'Shibuya Crossing', description: 'The world\'s busiest intersection, an iconic Tokyo sight.', image: require('../../../../assets/images/Kyoto.jpg') },
            { id: '3', title: 'Ghibli Museum', description: 'A whimsical museum showcasing the work of Studio Ghibli.', image: require('../../../../assets/images/Kyoto.jpg') },
        ],
        memories: [
            {
                id: 1,
                day: 1,
                title: 'Arrived in Kyoto!',
                description: 'The flight was long but we finally made it. Checked into the Ryokan and immediately found ramen.',
                date: 'Oct 12, 2024',
                time: '2:45 PM',
                images: [1, 2, 3],
            },
            {
                id: 2,
                day: 2,
                title: 'Bamboo Forest',
                description: 'Visited Arashiyama. The scenery was breathtaking and the weather was perfect.',
                date: 'Oct 13, 2024',
                time: '5:30 PM',
                images: [4, 5],
            },
        ],
    },
    'trip-456': {
        id: 'trip-456',
        name: 'Miami Bachelor Party', 
        takeoffDays: 4,
        destination: 'Miami, Florida',
        startDate: '2026-05-08',
        endDate: '2026-05-11',
        image: require('../../../../assets/images/Miami.jpg'), // MAKE SURE THIS IMAGE EXISTS! Or swap with Kyoto
        weather: { temp: 85, location: 'Miami, FL', icon: 'wb-sunny' },
        readinessPercent: 90,
        notifications: [
            { id: 1, title: "Yacht Deposit Due", description: "Need $200 from each person by tomorrow.", icon: "warning", color: Colors.danger, lightColor: Colors.dangerLight },
        ],
        group: [
            { id: 2, name: "Hunter S.", initials: "HS", profileColor: '#32CD32', profilePic: null, active: true },
            { id: 4, name: "David L.", initials: "DL", profileColor: '#FF4500', profilePic: null, active: true },
            { id: 5, name: "Chris T.", initials: "CT", profileColor: '#8A2BE2', profilePic: null, active: false },
        ],
        budgetData: { totalSpent: 2150.00, totalBudget: 4000.00 },
        groupBalances: [
            { id: 4, name: 'David', balance: -200.00, avatar: 'https://i.pravatar.cc/150?u=david' },
            { id: 5, name: 'Chris', balance: 200.00, avatar: 'https://i.pravatar.cc/150?u=chris' },
        ],
        transactions: [
            { id: 1, title: 'Airbnb Deposit', payer: 'You', split: 'Split equally', amount: 1200.00, icon: 'home' },
            { id: 2, title: 'Groceries & Drinks', payer: 'David', split: 'Split equally', amount: 350.00, icon: 'cart' },
        ],
        timelineData: {
            '2026-05-08': [
                { id: '1', time: '2:00 PM', title: 'Check into Villa', category: 'Lodging', type: 'event' },
                { id: '2', time: '8:30 PM', title: 'Dinner at Carbone', category: 'Dinner Reservation', type: 'event' },
            ],
            '2026-05-09': [
                { id: '3', time: '11:00 AM', title: 'Private Boat Charter', category: 'Excursion', type: 'event' },
            ]
        },
        staysData: [
            {
                id: '1',
                name: 'Star Island Villa',
                address: '123 Star Island Dr, Miami Beach',
                checkIn: '05/08 2:00 PM',
                checkOut: '05/11 11:00 AM',
            },
        ],
        documents: [
            { id: '1', title: "Boat_Rental_Agreement.pdf", date: "2026-04-10", size: "1.2 MB" },
        ],
        ideaBoard: [
            { id: '1', title: 'Jet Ski Rentals', description: 'Rent jet skis for 2 hours in Biscayne Bay.', image: require('../../../../assets/images/Miami.jpg') },
            { id: '2', title: 'LIV Nightclub', description: 'Bottle service for Saturday night.', image: require('../../../../assets/images/Miami.jpg') },
        ],
        memories: [],
    },
    'trip-789': {
        id: 'trip-789',
        name: 'Euro Trip', 
        takeoffDays: 45,
        destination: 'Paris & Rome',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        image: require('../../../../assets/images/paris.png'), // MAKE SURE THIS IMAGE EXISTS! Or swap with Kyoto
        weather: { temp: 68, location: 'Paris, FR', icon: 'cloud' },
        readinessPercent: 20,
        notifications: [],
        group: [
            { id: 1, name: "Alice B.", initials: "AB", profileColor: '#1E90FF', profilePic: null, active: true },
            { id: 3, name: "Maria K.", initials: "MK", profileColor: '#FFA500', profilePic: null, active: true },
        ],
        budgetData: { totalSpent: 450.00, totalBudget: 8000.00 },
        groupBalances: [],
        transactions: [
            { id: 1, title: 'Train Tickets', payer: 'Alice', split: 'Split equally', amount: 450.00, icon: 'train' },
        ],
        timelineData: {
            '2026-07-01': [
                { id: '1', time: '10:00 AM', title: 'Land at CDG Airport', category: 'Travel', type: 'event' },
            ],
        },
        staysData: [],
        documents: [],
        ideaBoard: [
            { id: '1', title: 'Louvre Museum Tour', description: 'Skip-the-line guided tour.', image: require('../../../../assets/images/paris.png') },
            { id: '2', title: 'Colosseum Underground', description: 'Exclusive access to the dungeons.', image: require('../../../../assets/images/paris.png') },
        ],
        memories: [],
    }
};

const fetchTripData = async (tripId) => {
  console.log(`Fetching global trip data for: ${tripId}`);
  await new Promise(resolve => setTimeout(resolve, 600)); 
  return MOCK_TRIP_DATA[tripId] || MOCK_TRIP_DATA['trip-123']; 
};

const HeaderButton = ({ icon, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <BlurView intensity={10} tint="default" style={{ width: 34, height: 34, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.35)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <MaterialIcons name={icon} size={moderateScale(22)} color="white" />
        </BlurView>
    </TouchableOpacity>
);

const CustomHeader = ({ trip }) => (
    <View style={styles.headerContainer}>
        <Image 
            source={trip.image}
            style={styles.gradient}
            contentFit='cover'
            cachePolicy='memory-disk'
        />
            <LinearGradient
                style={styles.gradient}
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.6)', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.49, 0.78, 1]}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '5%', paddingTop: moderateScale(65) }}>
                <HeaderButton icon="arrow-back" onPress={() => console.log('back')}/>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                    <HeaderButton icon="search" onPress={() => console.log('search')} />
                    <HeaderButton icon="settings" onPress={() => console.log('settings')} />
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

export default function TripInfoLayout() {
    const { tripId } = useLocalSearchParams();
    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [unassignedIdeas, setUnassignedIdeas] = useState([
        { id: 'v1', title: 'Senso-ji Temple', category: 'Culture' },
        { id: 'v2', title: 'Robot Café', category: 'Fun' }
    ]);

    useEffect(() => {
        if (tripId) {
            setIsLoading(true);
            fetchTripData(tripId).then(data => {
                setTripData(data);
                setIsLoading(false);
            });
        }
    }, [tripId]);

    const addEventToBucket = (date, event) => {
        setTripData(prev => ({
            ...prev,
            timelineData: {
                ...prev.timelineData,
                [date]: [...(prev.timelineData[date] || []), { ...event, id: Date.now().toString(), type: 'event', time: 'TBD' }]
            }
        }));
        setUnassignedIdeas(prev => prev.filter(item => item.id !== event.id));
    };

    const updateDayEvents = (date, newlyOrderedData) => {
        setTripData(prev => ({
            ...prev,
            timelineData: {
                ...prev.timelineData,
                [date]: newlyOrderedData
            }
        }));
    };

    const contextValue = {
        ...tripData,      // All your destination, dates, and timelineData
        unassignedIdeas,       // The draggable cards array
        addEventToBucket,    // The drop function
        updateDayEvents   // The reorder function

    };

    if (isLoading || !tripData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <TripContext.Provider value={contextValue}>
            <View style={{ flex: 1 }}>
                <CustomHeader trip={tripData} />
                <Tabs 
                    screenOptions={{ 
                        tabBarStyle: { display: "none" },
                        headerShown: false,
                        unmountOnBlur: true, // Unmount screens when not focused to reset state
                    }} 
                >
                    <Tabs.Screen name="overview" options={{ title: "Overview" }} />
                    <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
                    <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
                    <Tabs.Screen name="docs" options={{ title: "Docs" }} />
                    <Tabs.Screen name="memories" options={{ title: "Memories" }} />
                </Tabs>
            </View>
        </TripContext.Provider>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: '39%',
    },
    imageBackground: {
        flex: 1,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: '5%',
        paddingTop: moderateScale(40),
        paddingBottom: moderateScale(28),
    },
    spacer: {
        flex: 1,
    },
    textContainer: {
        gap: 4,
    },
    destination: {
        color: 'white',
        fontSize: moderateScale(25),
        fontWeight: 'bold',
    },
    dateRange: {
        color: 'white',
        fontSize: moderateScale(12),
        marginTop: 4,
    },
});