import { useAuth } from "@/src/context/AuthContext";
import { getConnections } from "@/src/lib/connections";
import { getUserProfile } from "@/src/lib/profile"; // 1. Import your profile fetcher
import { getPastTrips, getUpcomingTrips } from "@/src/lib/trips";
import { useQuery, useQueryClient } from '@tanstack/react-query';

// 2. Add the same country extractor used in useProfileData
function extractCountry(destination) {
  const value = String(destination || '').trim();
  if (!value) return null;

  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.at(-1) : parts[0];
}

export function useHomeData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error
  } = useQuery({
    queryKey: ['homeData', user?.id], 
    queryFn: async () => {
      if (!user?.id) return null;

      // 3. Swap the manual Supabase call for your clean `getUserProfile` function
      const [
        profileResponse, 
        upcomingResponse, 
        pastResponse,
        connectionsResponse 
      ] = await Promise.all([
        getUserProfile(user.id),
        getUpcomingTrips(user.id),
        getPastTrips(user.id),
        getConnections(user.id), 
      ]);

      // --- THE MAGIC: Seed ALL the caches! ---
      
      // 1. Seed Upcoming Trips
      if (upcomingResponse) {
        queryClient.setQueryData(['upcomingTrips', user.id], upcomingResponse);
      }
      
      // 2. Seed Past Trips
      if (pastResponse) {
        queryClient.setQueryData(['pastTrips', user.id], pastResponse);
      }

      // 3. Seed Connections
      if (connectionsResponse) {
        queryClient.setQueryData(['connections', user.id], {
          data: connectionsResponse.data ?? [],
          tableMissing: !!connectionsResponse.tableMissing
        });
      }

      // 4. Seed Profile Data (Combining what we already fetched!)
      const allTrips = [...(upcomingResponse ?? []), ...(pastResponse ?? [])];
      const destinations = [];
      const seenDestinations = new Set();
      const seenCountries = new Set();

      for (const trip of allTrips) {
        const destination = String(trip?.destination || '').trim();
        if (destination && !seenDestinations.has(destination)) {
          seenDestinations.add(destination);
          destinations.push(destination);
        }

        const country = extractCountry(destination);
        if (country) {
          seenCountries.add(country);
        }
      }

      // Match the exact object structure that `useProfileData` expects
      queryClient.setQueryData(['profileData', user.id], {
        profile: profileResponse ?? null,
        connections: connectionsResponse?.data ?? [],
        recentDestinations: destinations.slice(0, 6),
        stats: {
          trips: allTrips.length,
          buddies: connectionsResponse?.data?.length ?? 0,
          countries: seenCountries.size,
        },
      });

      // --- Return the sliced data for the Home Dashboard UI ---
      return {
        profile: profileResponse ?? null,
        upcomingTrips: (upcomingResponse ?? []).slice(0, 3), 
        pastTrips: (pastResponse ?? []).slice(0, 6),
      };
    },
    enabled: !!user?.id, 
    staleTime: 1000 * 60 * 5, 
  });

  return {
    loading: isLoading, 
    isRefreshing: isRefetching, 
    profile: data?.profile ?? null,
    upcomingTrips: data?.upcomingTrips ?? [],
    pastTrips: data?.pastTrips ?? [],
    refetch, 
    error
  };
}