import { useAuth } from '@/src/context/AuthContext';
import { getConnections } from '@/src/lib/connections';
import { getUserProfile } from '@/src/lib/profile';
import { getAllTripsForUser } from '@/src/lib/trips';
import { useCallback, useEffect, useState } from 'react';

function extractCountry(destination) {
  const value = String(destination || '').trim();
  if (!value) return null;

  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.at(-1) : parts[0];
}

export function useProfileData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [recentDestinations, setRecentDestinations] = useState([]);
  const [stats, setStats] = useState({ trips: 0, buddies: 0, countries: 0 });

  const loadProfileData = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setConnections([]);
      setRecentDestinations([]);
      setStats({ trips: 0, buddies: 0, countries: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
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

      setProfile(profileData ?? null);
      setConnections(connectionsResponse?.data ?? []);
      setRecentDestinations(destinations.slice(0, 6));
      setStats({
        trips: allTrips.length,
        buddies: connectionsResponse?.data?.length ?? 0,
        countries: seenCountries.size,
      });
    } catch (error) {
      console.warn(error?.message || 'Could not load profile data');
      setProfile(null);
      setConnections([]);
      setRecentDestinations([]);
      setStats({ trips: 0, buddies: 0, countries: 0 });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  return {
    loading,
    profile,
    connections,
    recentDestinations,
    stats,
    reloadProfileData: loadProfileData,
  };
}
