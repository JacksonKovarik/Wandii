import { getIsLoggedIn } from "@/src/utils/auth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; // 1. Import StatusBar from expo
import { Platform, UIManager } from "react-native";
import { MenuProvider } from "react-native-popup-menu";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const isLoggedIn = getIsLoggedIn(); 

export default function RootLayout() {
  return (
    <MenuProvider>
      <StatusBar style="dark" /> 

      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)"  options={{ headerShown: false }}/>
          <Stack.Screen name="(add-trips)" options={{ headerShown: false, presentation: "modal" }}/>
          <Stack.Screen name="(trip-info)/[tripId]" options={{ headerShown: false }}/>
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="sign-in" options={{headerShown: false}}/>
          <Stack.Screen name="sign-up" options={{headerShown: false}}/>
        </Stack.Protected>
      </Stack>
    </MenuProvider>
  );
}