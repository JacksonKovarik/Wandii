import { useAuth } from "@/src/context/AuthContext";
import { deleteTrip, getUpcomingTrips, leaveTrip } from "@/src/lib/trips";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useUpcomingTrips() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Data with useQuery
  const {
    data: trips = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['upcomingTrips', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log("Fetching upcoming trips...");
      const data = await getUpcomingTrips(user.id);
      // console.log("Upcoming trips fetched:", data);
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // 2. Mutation for Deleting a Trip
  const deleteTripMutation = useMutation({
    mutationFn: async (tripId) => {
      const { error } = await deleteTrip(user.id, tripId);
      if (error) throw new Error(error.message);
      return tripId;
    },
    onSuccess: () => {
      // Magic: Refresh upcoming trips AND the home dashboard data!
      queryClient.invalidateQueries({ queryKey: ['upcomingTrips', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['homeData', user?.id] });
    },
    onError: (error) => {
      Alert.alert("Could not delete trip", error.message);
    }
  });

  // 3. Mutation for Leaving a Trip
  const leaveTripMutation = useMutation({
    mutationFn: async (tripId) => {
      const { error } = await leaveTrip(user.id, tripId);
      if (error) throw new Error(error.message);
      return tripId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingTrips', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['homeData', user?.id] });
    },
    onError: (error) => {
      Alert.alert("Could not leave trip", error.message);
    }
  });

  // Action Handlers
  const handleDeleteTrip = (tripId) => {
    if (!user) return;
    Alert.alert("Delete Trip", "Are you sure you want to delete this upcoming trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTripMutation.mutate(tripId), // Trigger mutation
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
        onPress: () => leaveTripMutation.mutate(tripId), // Trigger mutation
      },
    ]);
  };

  return {
    trips,
    loading: isLoading, // True only on first fetch
    isRefreshing: isRefetching,
    user,
    refetch,
    handleDeleteTrip,
    handleLeaveTrip,
  };
}