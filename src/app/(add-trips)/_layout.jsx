import AddTripHeader from "@/src/components/addTripHeader";
import { Stack, useSegments } from "expo-router";
import { View } from "react-native";

export default function AddTripsLayout() {
    const currentRoute = useSegments().slice(-1)[0];
    return (
        <View style={{ flex: 1 }}>
            <AddTripHeader title={currentRoute} />
            <Stack 
                screenOptions={{
                    headerShown: false,
                }} 
            >
                <Stack.Screen name="tripPlanFirst" />
                <Stack.Screen name="tripPlanSecond" />
                <Stack.Screen name="tripPlanThird" />
            </Stack>
        </View>
    );
}
