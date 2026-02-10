import { Stack } from "expo-router";
import { getIsLoggedIn } from "../lib/auth";

const isLoggedIn = getIsLoggedIn(); // Replace with actual authentication logic

export default function RootLayout() {
  return (
    <Stack>

      {/* Make the root index route the welcome screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }}/>
        <Stack.Screen name="(add-trips)" options={{ headerShown: false, presentation: "modal", title: "Modal" }}/>
        <Stack.Screen name="(trip-info)/[tripId]" options={{ headerShown: false }}/>
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="sign-in" options={{headerShown: false}}/>
        <Stack.Screen name="sign-up" options={{headerShown: false}}/>
      </Stack.Protected>
      
    </Stack>
  );
}
