import { Colors } from '@/src/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textSecondary, headerShown: false }}>
      
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
          href: "/(tabs)/(trips)/upcoming",
          title: "Trips",
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />
        }} 
      />

      <Tabs.Screen
        name="connections"
        options={{
          title: "Connections",
          tabBarIcon: ({ color }) => <MaterialIcons name="public" size={24} color={color} />
        }}
      />

      <Tabs.Screen 
        name="profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
        }} 
      />

    </Tabs>
  );
}