import { Colors } from "@/src/constants/colors";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TripInfoLayout() {
  const dashboard = useTripDashboard();

  if (dashboard.isLoading || !dashboard.id) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(settings)"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="story"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
  );
}
