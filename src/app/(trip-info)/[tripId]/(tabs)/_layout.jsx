import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import DateUtils from "@/src/utils/DateUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";


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
                    <HeaderButton icon="settings" onPress={() => router.navigate(`/(trip-info)/${trip.id}/(settings)/settings`)} />
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


export default function TripTabsLayout() {
    const tripData = useTrip();
    if (!tripData) return null;

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" /> 
            <CustomHeader trip={tripData} />
            <Tabs screenOptions={{ tabBarStyle: { display: "none" }, headerShown: false, unmountOnBlur: true }}>
                <Tabs.Screen name="overview" options={{ title: "Overview" }} />
                <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
                <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
                <Tabs.Screen name="docs" options={{ title: "Docs" }} />
                <Tabs.Screen name="memories" options={{ title: "Memories" }} />
                <Tabs.Screen name="album" options={{ headerShown: false }} />
            </Tabs>
        </View>
    )
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