import { Colors } from "@/src/constants/colors";
import { useTripDashboard } from "@/src/hooks/useTripDashboard"; // ADDED
import { supabase } from "@/src/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // ADDED
import * as Clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function ManageMembersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tripId } = useTripDashboard(); 
  
  const [currentUserId, setCurrentUserId] = useState(null);

  // 憖 1. Wrap the fetch inside useQuery for caching and auto-fetching
  const { data: members = [], isLoading: loading } = useQuery({
    queryKey: ['tripMembers', tripId],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Could not get user auth.");
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('Trip_Members')
        .select(`role, status, user_id, Users!inner (user_id, first_name, last_name, username, avatar_url)`)
        .eq('trip_id', tripId);

      if (error) throw error;

      const formattedMembers = data.map((item) => ({
        id: item.user_id,
        role: item.role,
        status: item.status,
        firstName: item.Users.first_name,
        lastName: item.Users.last_name,
        username: item.Users.username,
        avatarUrl: item.Users.avatar_url,
      }));

      // Sort roles: Owner > Admin > Member
      formattedMembers.sort((a, b) => {
        const roleWeights = { owner: 3, admin: 2, member: 1 };
        return (roleWeights[b.role] || 0) - (roleWeights[a.role] || 0);
      });

      return formattedMembers;
    }
  });

  // Calculate current user's role natively from the cached data
  const currentUserRole = useMemo(() => {
    const me = members.find(m => m.id === currentUserId);
    return me ? me.role : 'member';
  }, [members, currentUserId]);

  // 憖 2. Use Mutation for removing a member optimistically
  const { mutate: removeMember } = useMutation({
    onMutate: async (userIdToRemove) => {
      await queryClient.cancelQueries({ queryKey: ['tripMembers', tripId] });
      const previousMembers = queryClient.getQueryData(['tripMembers', tripId]);
      
      // Optimistically remove from UI
      queryClient.setQueryData(['tripMembers', tripId], (old) => 
        old ? old.filter(m => m.id !== userIdToRemove) : old
      );

      return { previousMembers };
    },
    mutationFn: async (userIdToRemove) => {
      const { error } = await supabase
        .from('Trip_Members')
        .delete()
        .match({ trip_id: tripId, user_id: userIdToRemove });

      if (error) throw error;
    },
    onError: (err, userIdToRemove, context) => {
      console.error("Error removing member:", err);
      Alert.alert("Error", "Could not remove user. Please try again.");
      // Roll back
      queryClient.setQueryData(['tripMembers', tripId], context.previousMembers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tripMembers', tripId] });
    }
  });

  const handleCopyInvite = async () => {
    const dummyLink = `https://wandii.app/join/${tripId}`;
    await Clipboard.setStringAsync(dummyLink);
    Alert.alert("Copied!", "Invite link copied to clipboard.");
  };

  const handleRemoveMember = (userIdToRemove, userName) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${userName} from this trip?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => removeMember(userIdToRemove) // Call mutation here
        }
      ]
    );
  };

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  const renderMember = ({ item }) => {
    const showRemoveBtn = canManageMembers && item.id !== currentUserId && item.role !== 'owner';

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{item.firstName?.charAt(0)}</Text>
            </View>
          )}
          
          <View style={styles.nameContainer}>
            <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
            <View style={styles.usernameRow}>
              <Text style={styles.memberUsername}>@{item.username}</Text>
              <View style={[styles.roleBadge, item.role === 'owner' && styles.roleBadgeOwner]}>
                <Text style={[styles.roleText, item.role === 'owner' && styles.roleTextOwner]}>
                  {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {showRemoveBtn && (
          <TouchableOpacity 
            style={styles.removeBtn} 
            onPress={() => handleRemoveMember(item.id, item.firstName)}
          >
            <MaterialIcons name="person-remove" size={20} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Members</Text>
        <View style={styles.headerBtn} /> 
      </View>

      {/* --- Invite Link Button --- */}
      <View style={styles.inviteSection}>
        <TouchableOpacity style={styles.inviteButton} onPress={handleCopyInvite} activeOpacity={0.8}>
          <MaterialIcons name="link" size={24} color="#FFFFFF" />
          <Text style={styles.inviteButtonText}>Copy Invite Link</Text>
        </TouchableOpacity>
      </View>

      {/* --- Members List --- */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderMember}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No members found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: moderateScale(20), paddingTop: moderateScale(20), paddingBottom: moderateScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray,
  },
  headerBtn: { minWidth: moderateScale(60), justifyContent: 'center' },
  title: { fontSize: moderateScale(17), fontWeight: '700', color: Colors.darkBlue },
  doneText: { fontSize: moderateScale(16), color: Colors.primary, fontWeight: '600' },
  
  // Invite Section
  inviteSection: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(10), // Reduced slightly to balance with list padding
  },
  inviteButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: moderateScale(16), // Slightly taller for modern feel
    borderRadius: moderateScale(16), // Rounder corners
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(8),
    // Modern colored shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700', // Bolder text
  },

  // List & Cards
  listContainer: { 
    padding: moderateScale(20),
    paddingTop: moderateScale(10),
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Pure white card
    padding: moderateScale(16),
    borderRadius: moderateScale(16), // Softer, rounder corners
    marginBottom: moderateScale(16), // More breathing room between cards
    // Faint border
    borderWidth: 1,
    borderColor: '#F0F2F5', 
    // Subtle drop shadow to pop off the page
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2, // For Android
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(14), // Slightly more gap between avatar and text
    flex: 1,
  },
  avatar: {
    width: moderateScale(46), // Slightly larger avatars
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: Colors.lightGray,
  },
  avatarPlaceholder: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: moderateScale(16),
    color: Colors.darkBlue,
    fontWeight: '700', // Bolder name
    marginBottom: moderateScale(4),
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  memberUsername: {
    fontSize: moderateScale(13),
    color: Colors.textSecondaryLight,
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: '#F3F4F6', // Modern soft gray
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(12), // Pill shape
  },
  roleBadgeOwner: {
    backgroundColor: '#FFFBEB', // Very soft yellow/gold
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  roleText: {
    fontSize: moderateScale(10),
    color: Colors.textSecondary,
    fontWeight: '700', // Bolder badge text
  },
  roleTextOwner: {
    color: '#B45309', // Darker gold/amber text
  },
  removeBtn: {
    padding: moderateScale(10),
    backgroundColor: '#FEF2F2', // Modern ultra-light red
    borderRadius: moderateScale(20), // Fully circular button
  },
  emptyText: { 
    textAlign: 'center', 
    color: Colors.textSecondary, 
    marginTop: moderateScale(20) 
  }
});