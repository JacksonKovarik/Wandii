import { supabase } from "@/src/lib/supabase";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // store the current session
  const [session, setSession] = useState(null);

  // track loading state while restoring session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // load the current session on app start
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    });

    // listen for login/logout/session changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // memoized context value
  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,

      // sign out the user using Supabase
      signOut: () => supabase.auth.signOut(),
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// custom hook to access the auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}