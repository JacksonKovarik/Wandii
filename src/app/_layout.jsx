import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { TripDraftProvider } from "@/src/context/TripDraftContext";
import { Stack } from "expo-router";
import React from "react";

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const isLoggedIn = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index route */}
      <Stack.Screen name="index" />

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
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripDraftProvider>
        <RootNavigator />
      </TripDraftProvider>
    </AuthProvider>
  );
}
