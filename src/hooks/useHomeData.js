import { useAuth } from "@/src/context/AuthContext";
import { getPastTrips, getUpcomingTrips } from "@/src/lib/trips";
import { supabase } from "@/src/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export function useHomeData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);

  const loadHomeData = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setUpcomingTrips([]);
      setPastTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profileResponse, upcomingResponse, pastResponse] = await Promise.all([
        supabase
          .from("Users")
          .select("user_id, first_name, last_name, avatar_url, username")
          .eq("user_id", user.id)
          .maybeSingle(),
        getUpcomingTrips(user.id),
        getPastTrips(user.id),
      ]);

      if (profileResponse.error) {
        console.warn("Could not load profile:", profileResponse.error.message);
      }

      setProfile(profileResponse.data ?? null);
      setUpcomingTrips((upcomingResponse ?? []).slice(0, 3));
      setPastTrips((pastResponse ?? []).slice(0, 6));
    } catch (error) {
      console.warn(error?.message || "Could not load home data");
      setProfile(null);
      setUpcomingTrips([]);
      setPastTrips([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return {
    loading,
    user,
    profile,
    upcomingTrips,
    pastTrips,
    reloadHomeData: loadHomeData,
  };
}
