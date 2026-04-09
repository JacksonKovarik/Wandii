import NextStepButton from '@/src/components/nextStepButton';
import { useAuth } from '@/src/context/AuthContext';
import { useTripDraft } from '@/src/context/TripDraftContext';
import { getConnectionTableMissingMessage, getConnections } from '@/src/lib/connections';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

function ConnectionRow({ person, selected, onToggle }) {
  return (
    <TouchableOpacity style={styles.connectionRow} onPress={onToggle} activeOpacity={0.85}>
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarText}>{getInitials(person?.full_name || person?.username || 'W')}</Text>
      </View>

      <View style={styles.connectionTextWrap}>
        <Text style={styles.connectionName}>{person?.full_name || 'Traveler'}</Text>
        <Text style={styles.connectionSubtitle}>
          {person?.username ? `@${person.username}` : person?.email || 'Wandii traveler'}
        </Text>
      </View>

      <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
        {selected ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function TripPlanSecond() {
  const router = useRouter();
  const { user } = useAuth();
  const { draft, setField } = useTripDraft();
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(
    () => new Set((draft.invitedConnectionIds || []).map(String)),
    [draft.invitedConnectionIds]
  );

  const filteredConnections = useMemo(() => {
    const query = String(search || '').trim().toLowerCase();
    if (!query) return connections;

    return connections.filter((person) => {
      const haystack = [person.full_name, person.username, person.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [connections, search]);

  const loadConnections = useCallback(async () => {
    if (!user?.id) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getConnections(user.id);
      setTableMissing(!!response.tableMissing);
      setConnections(response.data || []);
    } catch (error) {
      console.warn(error?.message || 'Could not load connections');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [loadConnections])
  );

  const toggleConnection = (personId) => {
    const current = new Set((draft.invitedConnectionIds || []).map(String));
    const id = String(personId);

    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }

    setField('invitedConnectionIds', Array.from(current));
  };

  return (
    <View style={styles.screen}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentWrap}>
          <Text style={styles.header}>Invite Connections</Text>
          <Text style={styles.subHeader}>
            Trip adventures are better together. Pick the connections you want on this trip.
          </Text>

          <View style={styles.inputBar}>
            <Ionicons name="search-outline" size={18} color="#9d9d9d" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your connections"
              placeholderTextColor="#9d9d9d"
              style={styles.inputText}
              multiline={false}
              numberOfLines={1}
              maxLength={45}
            />
          </View>

          <View style={styles.selectedPill}>
            <Text style={styles.selectedPillText}>
              {draft.invitedConnectionIds?.length || 0} connection{(draft.invitedConnectionIds?.length || 0) === 1 ? '' : 's'} selected
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/connections')}>
              <Text style={styles.manageConnectionsText}>Manage Connections</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {tableMissing ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Connections need one database migration</Text>
                <Text style={styles.noticeBody}>{getConnectionTableMissingMessage()}</Text>
              </View>
            ) : loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#FF8820" />
              </View>
            ) : filteredConnections.length > 0 ? (
              filteredConnections.map((person) => (
                <ConnectionRow
                  key={person.user_id}
                  person={person}
                  selected={selectedIds.has(String(person.user_id))}
                  onToggle={() => toggleConnection(person.user_id)}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {connections.length === 0 ? 'No connections yet' : 'No matching connections'}
                </Text>
                <Text style={styles.emptyBody}>
                  {connections.length === 0
                    ? 'Add travelers from the Connections tab, then come back here to invite them.'
                    : 'Try a different search or clear the search box.'}
                </Text>
                {connections.length === 0 ? (
                  <TouchableOpacity style={styles.addPeopleButton} onPress={() => router.push('/(tabs)/connections')}>
                    <Text style={styles.addPeopleButtonText}>Go to Connections</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <NextStepButton onPress={() => router.push('/(add-trips)/tripPlanThird')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: verticalScale(15),
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  inputBar: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputText: {
    flex: 1,
    fontSize: moderateScale(15),
    color: 'black',
  },
  header: {
    fontSize: moderateScale(28),
    fontWeight: '700',
  },
  subHeader: {
    fontSize: moderateScale(15),
    marginBottom: 24,
    color: '#626262',
  },
  selectedPill: {
    backgroundColor: '#FFF4E8',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  selectedPillText: {
    color: '#B45309',
    fontWeight: '700',
  },
  manageConnectionsText: {
    color: '#FF8820',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: verticalScale(20),
  },
  connectionRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  avatarFallback: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#FFE4CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#C2410C',
    fontWeight: '800',
  },
  connectionTextWrap: {
    flex: 1,
    marginLeft: scale(12),
  },
  connectionName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#111827',
  },
  connectionSubtitle: {
    color: '#6B7280',
    marginTop: verticalScale(3),
    fontSize: moderateScale(12),
  },
  checkCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#FF8820',
    borderColor: '#FF8820',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    padding: scale(20),
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(6),
  },
  emptyBody: {
    color: '#6B7280',
    lineHeight: 20,
  },
  addPeopleButton: {
    marginTop: verticalScale(16),
    backgroundColor: '#FF8820',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  addPeopleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: moderateScale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#FED7AA',
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
  loadingWrap: {
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
});
