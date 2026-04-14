import { useAuth } from "@/src/context/AuthContext";
import { getPastTrips } from "@/src/lib/trips";
import { useQuery } from "@tanstack/react-query";

export function usePastTrips() {
  const { user } = useAuth();

  const {
    data: trips = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['pastTrips', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log("Fetching past trips...");
      const data = await getPastTrips(user.id);
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    trips,
    loading: isLoading, // True only on the very first load
    isRefreshing: isRefetching,
    user,
    refetch,
  };
}