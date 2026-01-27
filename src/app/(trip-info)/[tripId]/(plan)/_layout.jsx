import { Tabs } from "expo-router";

export default function PlanLayout() {
  return (
    <Tabs 
        screenOptions={{ 
            tabBarStyle: {display: 'none'},
            headerShown: false
        }} 
    >
        <Tabs.Screen name="idea-board" options={{ title: "Idea Board" }} />
        <Tabs.Screen name="timeline" options={{ title: "Timeline" }} />
        <Tabs.Screen name="map" options={{ title: "Map" }} />
    </Tabs>
  );
}
