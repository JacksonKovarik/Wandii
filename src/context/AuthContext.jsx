import { supabase } from "@/src/lib/supabase";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("getSession error:", error);
        }

        if (!mounted) return;

        const currentSession = data?.session ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        console.error("Auth bootstrap error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,

      signUp: async ({ email, password, options }) => {
        // 1. Sign up the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options,
        });

        // 2. If successful, insert their details into the public Users table
        if (!error && data?.user) {
          const { error: insertError } = await supabase
            .from("Users")
            .insert([
              {
                id: data.user.id, // Link to the auth.users UUID
                email: email,
                first_name: options?.data?.first_name || "",
                last_name: options?.data?.last_name || "",
              },
            ]);

          if (insertError) {
            console.error("Error saving to Users table:", insertError);
            // You can optionally return this error to handle it in the UI
            // return { data, error: insertError };
          }
        }

        return { data, error };
      },

      signIn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { data, error };
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
      },
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}