import { useAuth } from '@/src/context/AuthContext';
import { getConnections } from '@/src/lib/connections';
import { getUserProfile } from '@/src/lib/profile';
import { getAllTripsForUser } from '@/src/lib/trips';
import { useQuery } from '@tanstack/react-query';

function extractCountry(destination) {
  const value = String(destination || '').trim();
  if (!value) return null;

  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.at(-1) : parts[0];
}

export function useProfileData() {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['profileData', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching profile data...');
      const [profileData, tripsData, connectionsResponse] = await Promise.all([
        getUserProfile(user.id),
        getAllTripsForUser(user.id),
        getConnections(user.id),
      ]);

      const allTrips = tripsData ?? [];
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

      return {
        profile: profileData ?? null,
        connections: connectionsResponse?.data ?? [],
        recentDestinations: destinations.slice(0, 6),
        stats: {
          trips: allTrips.length,
          buddies: connectionsResponse?.data?.length ?? 0,
          countries: seenCountries.size,
        },
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes!
  });

  return {
    loading: isLoading, // True ONLY on the first load
    isRefreshing: isRefetching,
    profile: data?.profile ?? null,
    connections: data?.connections ?? [],
    recentDestinations: data?.recentDestinations ?? [],
    stats: data?.stats ?? { trips: 0, buddies: 0, countries: 0 },
    refetch,
  };
}