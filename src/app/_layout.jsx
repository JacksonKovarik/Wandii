import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { TripDraftProvider } from "@/src/context/TripDraftContext";
import { Stack } from "expo-router";
import React from "react";

function RootNavigator() {
  const { user, loading } = useAuth();

  // You can show a splash/loading screen here if you want.
  if (loading) return null;

  const isLoggedIn = !!user;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Logged in */}
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(add-trips)"
          options={{ headerShown: false, presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen name="(trip-info)/[tripId]" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Logged out */}
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
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