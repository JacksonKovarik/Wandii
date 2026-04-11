import { Colors } from "@/src/constants/colors";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import { TripContext } from "@/src/utils/TripContext";
import { Stack } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

// ==========================================
// MAIN LAYOUT COMPONENT
// ==========================================
export default function TripInfoLayout() {
    const dashboard = useTripDashboard();

    const contextValue = useMemo(() => {
        if (!dashboard.id) return {}; // Failsafe fallback
        return dashboard;
    }, [dashboard]);

    if (dashboard.isLoading || !dashboard.id) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <TripContext.Provider value={contextValue}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)"/>
                <Stack.Screen name="(settings)" options={{
                    presentation: 'modal'
                }} />
            </Stack>
        </TripContext.Provider>
    );
  }
