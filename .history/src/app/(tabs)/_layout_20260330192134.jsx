import { Colors } from '@/src/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";


export default function Layout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textSecondary}}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: "Home", 
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />
        }} 
      />
      
      <Tabs.Screen 
        name="(trips)" 
        options={{ 
          headerShown: false, 
          title: "Trips", 
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} /> 
        }} 
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <MaterialIcons name="search" size={24} color={color} />
        }}
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
        }} 
      />

    </Tabs>
  );
}
