import { Tabs } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function PlanLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs 
          screenOptions={{ 
              tabBarStyle: {display: 'none'},
              headerShown: false
          }} 
      >
          <Tabs.Screen name="idea-board" options={{ title: "Idea Board" }} />
          <Tabs.Screen name="timeline" options={{ title: "Timeline" }} />
          <Tabs.Screen name="map" options={{ title: "Map" }} />
          <Tabs.Screen name="stays" options={{ title: "Stays" }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}
