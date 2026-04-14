import TripInfoScrollView from '@/src/components/trip-info/tripInfoScrollView';
import { useConnectionsData } from '@/src/hooks/useConnections';
import { getConnectionTableMissingMessage } from '@/src/lib/connections';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Avatar({ user }) {
  const hasImage = typeof user?.avatar_url === 'string' && user.avatar_url;

  if (hasImage) {
    return (
      <Image
        source={{ uri: user.avatar_url }}
        style={styles.avatarImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarFallbackText}>{getInitials(user?.full_name || user?.username || 'W')}</Text>
    </View>
  );
}

function UserRow({ user, actionLabel, onPress, variant = 'primary', disabled = false, subtitle }) {
  return (
    <View style={styles.userRow}>
      <Avatar user={user} />

      <View style={styles.userTextWrap}>
        <Text style={styles.userName}>{user?.full_name || 'Traveler'}</Text>
        <Text style={styles.userSubtitle}>
          {subtitle || (user?.username ? `@${user.username}` : user?.email || 'Wandii traveler')}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          variant === 'secondary' && styles.actionButtonSecondary,
          disabled && styles.actionButtonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text
          style={[
            styles.actionButtonText,
            variant === 'secondary' && styles.actionButtonSecondaryText,
            disabled && styles.actionButtonDisabledText,
          ]}
        >
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Connections() {
  // 1. Pull the data and mutation functions from our TanStack hook
  const {
    connections,
    isTableMissing,
    isLoadingConnections,
    searchResults,
    isSearching,
    performSearch,
    addConnection,
    removeConnection,
    refetchConnections
  } = useConnectionsData();

  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  // Safely map connection IDs (handling both normalized 'id' and 'user_id')
  const connectionIds = useMemo(
    () => new Set((connections || []).map((connection) => String(connection.user_id || connection.id))),
    [connections]
  );

  // 2. Silently update in the background when navigating to the tab
  useFocusEffect(
    useCallback(() => {
      refetchConnections();
    }, [refetchConnections])
  );

  const runSearch = (value) => {
    setSearch(value);
    performSearch(value); // Let TanStack handle the actual search query
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchConnections(); // TanStack handles the promise automatically
    setRefreshing(false);
  };

  const handleAddConnection = async (otherUserId) => {
    try {
      setBusyUserId(otherUserId);
      // TanStack handles the database call and automatically refetches!
      await addConnection(otherUserId); 
    } catch (error) {
      // The hook handles throwing the alert, but we catch it here so we don't crash
      console.warn("Add connection error:", error);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemoveConnection = (otherUserId, name) => {
    Alert.alert('Remove connection', `Remove ${name || 'this connection'} from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyUserId(otherUserId);
            await removeConnection(otherUserId); // Let TanStack handle the deletion and cache update
          } catch (error) {
             console.warn("Remove connection error:", error);
          } finally {
            setBusyUserId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
        <Text style={styles.subtitle}>Add travelers you want to invite faster later.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          value={search}
          onChangeText={runSearch}
          placeholder="Search users by name, username, or email"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      <TripInfoScrollView contentContainerStyle={styles.scrollContent} onRefresh={onRefresh}>
        {isTableMissing ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>One database step is still needed</Text>
            <Text style={styles.noticeBody}>{getConnectionTableMissingMessage()}</Text>
          </View>
        ) : null}

        {search.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>

            {isSearching ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#FF8820" />
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((person) => {
                const uniqueId = person.user_id || person.id;
                const alreadyConnected = connectionIds.has(String(uniqueId));
                const busy = busyUserId === uniqueId;
                return (
                  <UserRow
                    key={uniqueId}
                    user={person}
                    actionLabel={busy ? '...' : alreadyConnected ? 'Connected' : 'Add'}
                    onPress={() => !alreadyConnected && !busy && handleAddConnection(uniqueId)}
                    disabled={alreadyConnected || busy || isTableMissing}
                    subtitle={person.username ? `@${person.username}` : person.email}
                  />
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptyBody}>Try a different name, username, or email.</Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Connections</Text>

          {isLoadingConnections ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#FF8820" />
            </View>
          ) : connections.length > 0 ? (
            connections.map((person) => {
              const uniqueId = person.user_id || person.id;
              return (
                <UserRow
                  key={uniqueId}
                  user={person}
                  actionLabel={busyUserId === uniqueId ? '...' : 'Remove'}
                  onPress={() => handleRemoveConnection(uniqueId, person.full_name)}
                  variant="secondary"
                  disabled={busyUserId === uniqueId || isTableMissing}
                  subtitle={person.username ? `@${person.username}` : person.email}
                />
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No connections yet</Text>
              <Text style={styles.emptyBody}>Search above to add travelers you plan with often.</Text>
            </View>
          )}
        </View>
      </TripInfoScrollView>
    </View>
  );
}

// Keep all the exact original styles you provided!
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: verticalScale(62),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: moderateScale(30),
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  searchWrap: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(18),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#111827',
  },
  scrollContent: {
    padding: scale(20),
    paddingBottom: verticalScale(40),
  },
  noticeCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: moderateScale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: verticalScale(18),
  },
  noticeTitle: {
    color: '#C2410C',
    fontWeight: '800',
    marginBottom: verticalScale(6),
  },
  noticeBody: {
    color: '#9A3412',
    lineHeight: 20,
  },
  section: {
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  userRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarImage: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#FFE4CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#C2410C',
    fontWeight: '800',
  },
  userTextWrap: {
    flex: 1,
    marginLeft: scale(12),
  },
  userName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#111827',
  },
  userSubtitle: {
    marginTop: verticalScale(3),
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  actionButton: {
    backgroundColor: '#FF8820',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(9),
    borderRadius: moderateScale(12),
  },
  actionButtonSecondary: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButtonSecondaryText: {
    color: '#B91C1C',
  },
  actionButtonDisabledText: {
    color: '#6B7280',
  },
  loadingWrap: {
    paddingVertical: verticalScale(30),
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(6),
  },
  emptyBody: {
    color: '#6B7280',
    lineHeight: 20,
  },
});