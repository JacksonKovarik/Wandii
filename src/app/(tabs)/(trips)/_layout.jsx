import AddTripButton from "@/src/components/addTripButton";
import ReusableTabBar from "@/src/components/reusableTabBar";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const customHeader = () => (
    <View style={styles.container}>
        <View style={styles.headerContent}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>My Trips</Text>
                <AddTripButton />
            </View>
            <View style={styles.tabBarContainer}>
                <ReusableTabBar 
                    tabs={[
                        { label: "Upcoming", name: "upcoming", route: `/(tabs)/(trips)/upcoming` },
                        { label: "Past", name: "past", route: `/(tabs)/(trips)/past` },
                    ]}
                    extraTabStyles={{ flex: 1 }}
                />
            </View>
        </View>
    </View>
);

export default function TripsLayout() {
  return (
    <Tabs 
        screenOptions={{ 
            tabBarStyle: { display: 'none' },
            header: () => customHeader(),
        }} 
    >
        <Tabs.Screen name="upcoming" options={{ title: "Upcoming" }} />
        <Tabs.Screen name="past" options={{ title: "Past" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 10,
    },
    headerContent: {
        marginTop: 60,
        marginBottom: 10,
    },
    titleRow: {
        flexDirection: 'row',
        marginHorizontal: '5%',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    tabBarContainer: {
        width: '100%',
        alignItems: 'center',
    },
});