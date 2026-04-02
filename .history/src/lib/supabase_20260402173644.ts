import { createClient } from '@supabase/supabase-js';

// get values from your .env file
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
    persistSession: false, // react native does not use URL session detection
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`, // send anon key with requests
    },

    // custom fetch to support local edge function testing
    fetch: (url, options) => {
      let targetUrl = url.toString();

      // if calling an edge function and LOCAL_IP is set, rewrite the URL
      if (localIp && targetUrl.includes('/functions/v1/')) {
        targetUrl = targetUrl.replace(supabaseUrl, `http://${localIp}:54321`);
      }

      // send the request
      return fetch(targetUrl, options);
    },
  },
});