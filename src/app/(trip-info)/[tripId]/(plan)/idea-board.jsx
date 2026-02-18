import ReusableTabBar from "@/src/components/reusableTabBar";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function IdeaBoard() {
  const tripId = useLocalSearchParams();
  
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 10 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <ReusableTabBar 
            tabs={[
              { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripId}/(plan)/idea-board` },
              { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripId}/(plan)/timeline` },
              { label: "Map", name: "map", route: `/(trip-info)/${tripId}/(plan)/map` },
              { label: "Stays", name: "stays", route: `/(trip-info)/${tripId}/(plan)/stays` },
            ]}
          />
        </View>
      </View>
      <Text style={{ marginTop: 10, color: 'red' }}>Idea Board Screen</Text>
    </ScrollView>
  );
}
