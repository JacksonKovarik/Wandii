import FriendsList from '@/src/components/friendsList';
import ProfileHeader from '@/src/components/profileHeader';
import RecentDestinations from '@/src/components/recentDestinations';
import TripInfoScrollView from '@/src/components/trip-info/tripInfoScrollView';
import { useAuth } from '@/src/context/AuthContext';
import { useProfileData } from '@/src/hooks/useProfileData';
import { getInitialsFromName } from '@/src/lib/profile';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  
  // 1. Destructure `refetch` instead of `reloadProfileData`
  const { loading, profile, connections, recentDestinations, stats, refetch } = useProfileData();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const scrollRef = useRef(null);

  // 2. Silently update in the background on tab focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const initials = getInitialsFromName([profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || profile?.username || 'Traveler');

  const travelBuddies = (connections || []).map((connection) => ({
    id: connection.user_id,
    name: connection.full_name || 'Traveler',
    avatar: connection.avatar_url,
    initials: getInitialsFromName(connection.full_name || connection.username || 'W'),
  }));

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (error) {
      console.warn('Logout failed', error);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.loadingWrap]}>
        <ActivityIndicator size="large" color="#FF8820" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ProfileHeader 
        stats={stats} 
        user={profile} 
        initials={initials} 
      />

      <TripInfoScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: '5%' }} onRefresh={onRefresh}>
        <View style={styles.editButtonWrap}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/(settings)')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <RecentDestinations destinations={recentDestinations} />
        <FriendsList buddies={travelBuddies} />

        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutButton, loggingOut && { opacity: 0.7 }]}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Logging out...</Text>
              </View>
            ) : (
              <Text style={styles.logoutText}>Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      </TripInfoScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  editButtonWrap: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  editButton: {
    backgroundColor: '#FFF4E8',
    borderWidth: 1,
    borderColor: '#FFD6AE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FF8820',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingWrap: {
    paddingTop: 60,
    alignItems: 'center',
  },
  logoutContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
