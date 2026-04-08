import { useAuth } from "@/src/context/AuthContext";
import { getPastTrips } from "@/src/lib/trips";
import { useCallback, useEffect, useState } from "react";

export function usePastTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getPastTrips(user.id);
      setTrips(data ?? []);
    } catch (error) {
      console.warn(error?.message || "Could not load past trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  return {
    trips,
    loading,
    user,
    reloadTrips: loadTrips,
  };
}
