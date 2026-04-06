import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack 
        screenOptions={{ 
            headerShown: false,
        }} 
    >
        <Stack.Screen name="settings" />
        <Stack.Screen name="editField" />
        <Stack.Screen name="editDestination" />
        <Stack.Screen name="manageMembers" />
        <Stack.Screen name="editCurrency" />
    </Stack>
  );
}
