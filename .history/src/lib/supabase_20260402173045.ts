import { createClient } from '@supabase/supabase-js';

// 1. Your live Supabase project details
// Find these in your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, 
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    // ⚡️ THE FIX: Intercept the network request!
    fetch: (url, options) => {
      let targetUrl = url.toString();
      const localIp = process.env.LOCAL_IP;

      // If a local IP is set AND the app is trying to call an Edge Function,
      // rewrite the URL to point to your local machine's terminal.
      if (localIp && targetUrl.includes('/functions/v1/')) {
        targetUrl = targetUrl.replace(supabaseUrl, `http://${localIp}:54321`);
      }

      // Execute the request
      return fetch(targetUrl, options);
    }
  },
});