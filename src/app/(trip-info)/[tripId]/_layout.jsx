import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useLocalSearchParams } from "expo-router";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

const LOCAL_IMAGES = {
    kyoto: require("../../../../assets/images/Kyoto.jpg"),
    // paris: require("../../../../assets/images/Paris.jpg"),
};

const CustomHeader = ({ trip }) => (
    <View style={styles.headerContainer}>
        <ImageBackground 
            source={trip.image?.startsWith('http') 
                ? { uri: trip.image } 
                : LOCAL_IMAGES[trip.image]}
            style={styles.imageBackground}
            resizeMode='cover'
        >
            <LinearGradient
                style={styles.gradient}
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.6)', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.49, 0.78, 1]}
            />

            <View style={styles.contentWrapper}>
                <View style={styles.spacer} />
                <View style={styles.textContainer}>
                    <Text style={styles.destination}>{trip.destination}</Text>
                    <Text style={styles.dateRange}>{trip.startDate} - {trip.endDate}</Text>
                </View>
            </View>
        </ImageBackground>

        <TripInfoTabBar tripId={trip.id}/>
    </View>
);

export default function TripInfoLayout() {
    const { tripId } = useLocalSearchParams();

    const data = {
        id: tripId,
        destination: "Kyoto, Japan",
        startDate: "2024-10-12",
        endDate: "2024-10-24",
        image: 'kyoto'
    };

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader trip={data} />
            <Tabs 
                screenOptions={{ 
                    tabBarStyle: { display: "none" },
                    headerShown: false
                }} 
            >
                <Tabs.Screen name="overview" options={{ title: "Overview" }} />
                <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
                <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
                <Tabs.Screen name="docs" options={{ title: "Docs" }} />
                <Tabs.Screen name="chat" options={{ title: "Chat" }} />
            </Tabs>
        </View>
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
        paddingTop: '20%',
        paddingBottom: '8%',
    },
    spacer: {
        flex: 1,
    },
    textContainer: {
        gap: 4,
    },
    destination: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    dateRange: {
        color: 'white',
        fontSize: 16,
        marginTop: 4,
    },
});