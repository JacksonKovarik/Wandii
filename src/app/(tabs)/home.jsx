import PlanNewTripCard from "@/src/components/planNewTripCard";
import { Colors } from "@/src/constants/colors";
import { useHomeData } from "@/src/hooks/useHomeData";
import DateUtils from "@/src/utils/DateUtils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const FALLBACK_MEMORY_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

function formatTripDate(startDate, endDate) {
  if (startDate && endDate) {
    return DateUtils.formatRange(
      DateUtils.parseYYYYMMDDToDate(startDate),
      DateUtils.parseYYYYMMDDToDate(endDate)
    );
  }

  if (startDate) {
    return DateUtils.formatDate(DateUtils.parseYYYYMMDDToDate(startDate));
  }

  if (endDate) {
    return DateUtils.formatDate(DateUtils.parseYYYYMMDDToDate(endDate));
  }

  return "Dates coming soon";
}

function GroupRow({ trip, onPress }) {
  const members = trip?.Trip_Members ?? [];
  const imageSource =
    typeof trip?.cover_photo_url === "string" && trip.cover_photo_url
      ? { uri: trip.cover_photo_url }
      : { uri: FALLBACK_MEMORY_IMAGE };

  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={imageSource}
        style={styles.groupImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      <View style={styles.groupContent}>
        <Text style={styles.groupTitle} numberOfLines={1}>
          {trip?.title || "Untitled Trip"}
        </Text>
        <Text style={styles.groupSubtitle} numberOfLines={1}>
          {members.length} member{members.length === 1 ? "" : "s"}, {formatTripDate(trip?.start_date, trip?.end_date)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#B6B6B6" />
    </TouchableOpacity>
  );
}

function MemoryCard({ trip, onPress }) {
  const imageSource =
    typeof trip?.cover_photo_url === "string" && trip.cover_photo_url
      ? { uri: trip.cover_photo_url }
      : { uri: FALLBACK_MEMORY_IMAGE };

  return (
    <TouchableOpacity style={styles.memoryCard} activeOpacity={0.9} onPress={onPress}>
      <Image
        source={imageSource}
        style={styles.memoryImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.memoryOverlay}>
        <Text style={styles.memoryTitle} numberOfLines={2}>
          {trip?.title || "Past Trip"}
        </Text>
        <Text style={styles.memorySubtitle} numberOfLines={1}>
          {trip?.destination || "Memory"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();
  const { loading, profile, upcomingTrips, pastTrips, reloadHomeData } = useHomeData();

  useFocusEffect(
    useCallback(() => {
      reloadHomeData();
    }, [reloadHomeData])
  );

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Traveler";

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.nameText}>{displayName}</Text>
          </View>

          <TouchableOpacity style={styles.bellButton} activeOpacity={0.85}>
            <Ionicons name="notifications-outline" size={22} color="#111827" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <PlanNewTripCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <TouchableOpacity onPress={() => router.push("/(add-trips)/tripPlanFirst")}>
            <Text style={styles.sectionAction}>Create New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : upcomingTrips.length > 0 ? (
          <View style={styles.groupsList}>
            {upcomingTrips.map((trip) => (
              <GroupRow
                key={trip.id}
                trip={trip}
                onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyBody}>
              Create your first trip to start planning with your group.
            </Text>
            <Link href="/(add-trips)/tripPlanFirst" asChild push>
              <TouchableOpacity style={styles.inlineCreateButton}>
                <Text style={styles.inlineCreateButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Memories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/(trips)/past")}>
            <Text style={styles.viewAllText}>View All Albums</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : pastTrips.length > 0 ? (
          <View style={styles.memoriesGrid}>
            {pastTrips.slice(0, 4).map((trip) => (
              <MemoryCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push("/(tabs)/(trips)/past")}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyMemoriesCard}>
            <MaterialIcons name="photo-library" size={28} color={Colors.textSecondary} />
            <Text style={styles.emptyMemoriesTitle}>No memories yet</Text>
            <Text style={styles.emptyMemoriesBody}>
              Finished trips with cover photos will show up here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(28),
  },
  headerCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: scale(22),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(18),
    marginBottom: verticalScale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  welcomeText: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    marginBottom: verticalScale(4),
  },
  nameText: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: "#111827",
  },
  bellButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: scale(9),
    right: scale(11),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#FF6B6B",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(18),
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#111827",
  },
  sectionAction: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: Colors.primary,
  },
  viewAllText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  groupsList: {
    gap: verticalScale(10),
  },
  groupCard: {
    backgroundColor: "white",
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  groupImage: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: "#E5E7EB",
  },
  groupContent: {
    flex: 1,
    marginLeft: scale(12),
    marginRight: scale(8),
  },
  groupTitle: {
    fontSize: moderateScale(15),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(3),
  },
  groupSubtitle: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  memoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: verticalScale(14),
  },
  memoryCard: {
    width: "48%",
    height: verticalScale(165),
    borderRadius: scale(20),
    overflow: "hidden",
    backgroundColor: "#D1D5DB",
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  memoryOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    backgroundColor: "rgba(17,24,39,0.35)",
  },
  memoryTitle: {
    color: "white",
    fontSize: moderateScale(14),
    fontWeight: "800",
    marginBottom: verticalScale(2),
  },
  memorySubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: moderateScale(11),
    fontWeight: "500",
  },
  loadingBox: {
    backgroundColor: "white",
    borderRadius: scale(16),
    paddingVertical: verticalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: scale(18),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(18),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(6),
  },
  emptyBody: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(14),
  },
  inlineCreateButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    borderRadius: scale(999),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
  },
  inlineCreateButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: moderateScale(13),
  },
  emptyMemoriesCard: {
    backgroundColor: "white",
    borderRadius: scale(18),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMemoriesTitle: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(4),
    fontSize: moderateScale(15),
    fontWeight: "800",
    color: "#111827",
  },
  emptyMemoriesBody: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
});
