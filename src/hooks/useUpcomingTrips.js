import { useAuth } from "@/src/context/AuthContext";
import { deleteTrip, getUpcomingTrips, leaveTrip } from "@/src/lib/trips";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useUpcomingTrips() {
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
      const data = await getUpcomingTrips(user.id);
      setTrips(data ?? []);
    } catch (error) {
      console.warn(error?.message || "Could not load trips");
      setTrips([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleDeleteTrip = (tripId) => {
    if (!user) return;
    Alert.alert("Delete Trip", "Are you sure you want to delete this upcoming trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await deleteTrip(user.id, tripId);
          if (error) {
            Alert.alert("Could not delete trip", error.message);
            return;
          }
          loadTrips();
        },
      },
    ]);
  };

  const handleLeaveTrip = (tripId) => {
    if (!user) return;
    Alert.alert("Leave Trip", "Are you sure you want to leave this upcoming trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          const { error } = await leaveTrip(user.id, tripId);
          if (error) {
            Alert.alert("Could not leave trip", error.message);
            return;
          }
          loadTrips();
        },
      },
    ]);
  };

  return {
    trips,
    loading,
    user,
    handleDeleteTrip,
    handleLeaveTrip,
  };
}
