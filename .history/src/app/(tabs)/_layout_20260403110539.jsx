import { Colors } from '@/src/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textSecondary }}>
      
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
          headerShown: false,
          title: "Trips",
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />
        }} 
      />

      <Tabs.Screen
        name="network"
        options={{
          headerShown: false,
          title: "Network",
          tabBarIcon: ({ color }) => <MaterialIcons name="public" size={24} color={color} />
        }}
      />

      <Tabs.Screen 
        name="profile" 
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
        }} 
      />

    </Tabs>
  );
}