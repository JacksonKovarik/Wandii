import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import DateUtils from "@/src/utils/DateUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useLocalSearchParams } from "expo-router";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const LOCAL_IMAGES = {
    kyoto: require("../../../../assets/images/Kyoto.jpg"),
    // paris: require("../../../../assets/images/Paris.jpg"),
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
        </ImageBackground>

        <TripInfoTabBar tripId={ trip.id }/>
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
                <Tabs.Screen name="memories" options={{ title: "Memories" }} />
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