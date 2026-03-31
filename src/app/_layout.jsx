import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { TripDraftProvider } from "@/src/context/TripDraftContext";
import { Stack } from "expo-router";
import React from "react";

function RootNavigator() {
  // 1. Consume the context here, inside the provider!
  const { user, loading } = useAuth();

  // 2. Handle the loading state here before rendering the Stack
  if (loading) return null;

  const isLoggedIn = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index route */}
      {/* <Stack.Screen name="index" /> */}

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="(add-trips)"
          options={{ presentation: "modal" }}
        />

        <Stack.Screen name="(trip-info)/[tripId]" />
        <Stack.Screen name="settings" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    // 3. RootLayout solely handles wrapping the app in Providers now
    <AuthProvider>
      <TripDraftProvider>
        <RootNavigator />
      </TripDraftProvider>
    </AuthProvider>
  );
}