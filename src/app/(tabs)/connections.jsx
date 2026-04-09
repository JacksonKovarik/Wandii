import { useAuth } from '@/src/context/AuthContext';
import {
  addConnection,
  getConnectionTableMissingMessage,
  getConnections,
  removeConnection,
  searchUsers,
} from '@/src/lib/connections';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tableMissing, setTableMissing] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  const connectionIds = useMemo(
    () => new Set((connections || []).map((connection) => String(connection.user_id))),
    [connections]
  );

  const loadConnections = useCallback(async () => {
    if (!user?.id) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getConnections(user.id);
      if (response.tableMissing) {
        setTableMissing(true);
        setConnections([]);
      } else {
        setTableMissing(false);
        setConnections(response.data || []);
      }
    } catch (error) {
      console.warn(error?.message || 'Could not load connections');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const runSearch = useCallback(
    async (value) => {
      setSearch(value);

      const trimmed = String(value || '').trim();
      if (!trimmed || !user?.id) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await searchUsers(trimmed, user.id);
        setSearchResults(response.data || []);
      } catch (error) {
        console.warn(error?.message || 'Could not search users');
        setSearchResults([]);
      }
    },
    [user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [loadConnections])
  );

  const handleAddConnection = async (otherUserId) => {
    if (!user?.id) return;

    try {
      setBusyUserId(otherUserId);
      await addConnection(user.id, otherUserId);
      await loadConnections();
      if (search.trim()) {
        await runSearch(search);
      }
    } catch (error) {
      Alert.alert(
        'Could not add connection',
        tableMissing ? getConnectionTableMissingMessage() : error?.message || 'Unknown error'
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemoveConnection = async (otherUserId, name) => {
    Alert.alert('Remove connection', `Remove ${name || 'this connection'} from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyUserId(otherUserId);
            await removeConnection(user?.id, otherUserId);
            await loadConnections();
            if (search.trim()) {
              await runSearch(search);
            }
          } catch (error) {
            Alert.alert('Could not remove connection', error?.message || 'Unknown error');
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tableMissing ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>One database step is still needed</Text>
            <Text style={styles.noticeBody}>{getConnectionTableMissingMessage()}</Text>
          </View>
        ) : null}

        {search.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>

            {searchResults.length > 0 ? (
              searchResults.map((person) => {
                const alreadyConnected = connectionIds.has(String(person.user_id));
                const busy = busyUserId === person.user_id;
                return (
                  <UserRow
                    key={person.user_id}
                    user={person}
                    actionLabel={busy ? '...' : alreadyConnected ? 'Connected' : 'Add'}
                    onPress={() => !alreadyConnected && !busy && handleAddConnection(person.user_id)}
                    disabled={alreadyConnected || busy || tableMissing}
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

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#FF8820" />
            </View>
          ) : connections.length > 0 ? (
            connections.map((person) => (
              <UserRow
                key={person.user_id}
                user={person}
                actionLabel={busyUserId === person.user_id ? '...' : 'Remove'}
                onPress={() => handleRemoveConnection(person.user_id, person.full_name)}
                variant="secondary"
                disabled={busyUserId === person.user_id || tableMissing}
                subtitle={person.username ? `@${person.username}` : person.email}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No connections yet</Text>
              <Text style={styles.emptyBody}>Search above to add travelers you plan with often.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
