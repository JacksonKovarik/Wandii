import ReusableTabBar from "@/src/components/reusableTabBar";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function Timeline() {
    const tripId = useLocalSearchParams();
    return (
        <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 10 }}>
            <View style={{ width: '100%', alignItems: 'center' }}>
            <ReusableTabBar 
                tabs={[
                { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripId}/(plan)/idea-board` },
                { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripId}/(plan)/timeline` },
                { label: "Map", name: "map", route: `/(trip-info)/${tripId}/(plan)/map` }
                ]}
                extraBgStyle={{ backgroundColor: '#E0E0E0', width: '75%'}}
                extraTextStyle={{ fontSize: 14 }}
            />
            </View>
        </View>
        <Text style={{ marginTop: 10, color: 'red' }}>Timeline Screen</Text>
        </ScrollView>
    );
}