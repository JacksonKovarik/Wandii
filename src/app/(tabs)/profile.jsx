import FriendsList from '@/src/components/friendsList';
import ProfileHeader from '@/src/components/profileHeader';
import RecentDestinations from '@/src/components/recentDestinations';
import { useAuth } from '@/src/context/AuthContext';
import { useProfileData } from '@/src/hooks/useProfileData';
import { getInitialsFromName } from '@/src/lib/profile';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { loading, profile, connections, recentDestinations, stats, reloadProfileData } = useProfileData();
  const [loggingOut, setLoggingOut] = useState(false);
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      reloadProfileData();
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [reloadProfileData])
  );

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || 'Traveler';
  const initials = getInitialsFromName(displayName || profile?.username || 'Traveler');

  const travelBuddies = (connections || []).map((connection) => ({
    id: connection.user_id,
    name: connection.full_name,
    username: connection.username,
    avatar: connection.avatar_url,
  }));

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await signOut();
      if (error) {
        throw error;
      }
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ProfileHeader
        user={{
          name: displayName,
          username: profile?.username || '',
          trips: stats.trips,
          buddies: stats.buddies,
          countries: stats.countries,
        }}
        photo={profile?.avatar_url || null}
        initials={initials}
        onPressSettings={() => router.push('/(settings)')}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.editButtonWrap}>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(settings)')}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#FF8820" />
          </View>
        ) : (
          <>
            <View style={{ marginTop: 12, paddingHorizontal: 20 }}>
              <FriendsList
                buddies={travelBuddies}
                onPressMore={() => router.push('/(tabs)/connections')}
              />
            </View>

            <View style={{ marginTop: 40, paddingHorizontal: 20 }}>
              <RecentDestinations destinations={recentDestinations} />
            </View>
          </>
        )}

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
      </ScrollView>
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
    marginTop: 16,
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
