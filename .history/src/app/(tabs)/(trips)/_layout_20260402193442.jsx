import AddTripButton from "@/src/components/addTripButton";
import ReusableTabBar from "@/src/components/reusableTabBar";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const customHeader = () => (
    <View style={styles.container}>
        <View style={styles.headerContent}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>My Trips</Text>
                <AddTripButton iconColor="#FF8820" />
            </View>

            <View style={styles.tabBarContainer}>
                <ReusableTabBar
                    tabs={[
                        { label: "Upcoming", name: "upcoming", route: `/(tabs)/(trips)/upcoming` },
                        { label: "Past", name: "past", route: `/(tabs)/(trips)/past` },
                    ]}
                />
            </View>
        </View>
    </View>
);

export default function TripsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: { display: "none" },
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
        backgroundColor: "white",
        padding: 10,
        shadowColor: "#9D9D9D",
        borderBottomLeftRadius: moderateScale(20),
        borderBottomRightRadius: moderateScale(20),
        shadowOpacity: 0.4,
        shadowRadius: 0.8,
        shadowOffset: { width: 0, height: 2 },
    },

    headerContent: {
        marginTop: 60,
        marginBottom: 10,
    },

    titleRow: {
        flexDirection: "row",
        marginHorizontal: "5%",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },

    title: {
        fontSize: moderateScale(34),
        fontWeight: "bold",
        marginBottom: 5,
    },

    tabBarContainer: {
        width: "100%",
        alignItems: "center",
    },
});