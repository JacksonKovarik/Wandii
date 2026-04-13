import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { TripDraftProvider } from "@/src/context/TripDraftContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { MenuProvider } from "react-native-popup-menu";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // If a network request fails, retry it 2 times before giving up
      refetchOnWindowFocus: false, // Prevents random refetches when swapping apps on mobile
    },
  },
});

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
        <Stack.Screen name="(settings)" />
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
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <AuthProvider>
          <TripDraftProvider>
            <RootNavigator />
          </TripDraftProvider>
        </AuthProvider>
      </MenuProvider>
    </QueryClientProvider>
  );
}