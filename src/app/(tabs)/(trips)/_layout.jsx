import AddTripButton from "@/src/components/addTripButton";
import TripsTabBar from "@/src/components/tripsTabBar";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

const customHeader = () => (
    <View style={{ backgroundColor: 'white', padding: 10 }}>
        <View style={{ marginTop: 60, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', marginHorizontal: '5%', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 34, fontWeight: 'bold', marginBottom: 5 }}>My Trips</Text>
                <AddTripButton />
            </View>
            <View style={{ width: '100%', alignItems: 'center' }}>
                <TripsTabBar />
            </View>
        </View>
    </View>
);

export default function Layout() {
  return (
    <Tabs 
        screenOptions={{ 
            tabBarStyle: {display: 'none'},
            header: () => customHeader(),
        }} 
    >
        <Tabs.Screen name="upcoming" options={{ title: "Upcoming" }} />
        <Tabs.Screen name="past" options={{ title: "Past" }} />
    </Tabs>
  );
}
