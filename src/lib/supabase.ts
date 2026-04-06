import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import "react-native-url-polyfill/auto";

// 1. Your live Supabase project details
// Find these in your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const localIp = process.env.LOCAL_IP;

// warn if something is missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env values. Check your .env file.');
}

// create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true, 
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  // global: {
  //   headers: {
  //     Authorization: `Bearer ${supabaseAnonKey}`, // send anon key with requests
  //   },  
  //   fetch: (url, options) => {
  //     let targetUrl = url.toString();
  //     const localIp = process.env.LOCAL_IP;

  //     // If a local IP is set AND the app is trying to call an Edge Function,
  //     // rewrite the URL to point to your local machine's terminal.
  //     if (localIp && localIp.length > 0 && targetUrl.includes('/functions/v1/')) {
  //       targetUrl = targetUrl.replace(supabaseUrl, `http://${localIp}:54321`);
  //     }

  //     // Execute the request
  //     return fetch(targetUrl, options);
  //   }
  // },
});