import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";


export default function Layout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: "#FF8820"}}>
      <Tabs.Screen 
        name="index" 
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
          title: "Profile", 
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
        }} 
      />

    </Tabs>
  );
}
