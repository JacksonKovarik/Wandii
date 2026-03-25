import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

const supabaseUrl = extra.SUPABASE_URL;
const supabaseAnonKey = extra.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing SUPABASE_URL / SUPABASE_ANON_KEY. Add them to app.json -> expo.extra"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // important for React Native
  },
});