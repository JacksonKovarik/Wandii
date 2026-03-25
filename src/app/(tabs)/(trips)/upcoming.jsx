import AddTripButton from "@/src/components/addTripButton";
import { GroupDisplay } from "@/src/components/GroupDisplay";
import ProgressBar from "@/src/components/progressBar";
import { useAuth } from "@/src/context/AuthContext";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { deleteTrip, getUpcomingTrips } from "@/src/lib/trips";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { moderateScale, verticalScale } from "react-native-size-matters";

const FALLBACK_IMAGE = require("../../../../assets/images/Kyoto.jpg");

function toInitials(name) {
  return String(name || "Me")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ME";
}

function daysUntil(dateString) {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${dateString}T12:00:00`);
  return Math.max(0, Math.ceil((start - today) / 86400000));
}

function readinessPercent(trip) {
  const days = daysUntil(trip.start_date);
  if (days <= 3) return 90;
  if (days <= 14) return 70;
  if (days <= 30) return 50;
  return 30;
}

const UpcomingTripCard = ({ trip, currentUserName, onDelete }) => {
  const router = useRouter();
  const percent = readinessPercent(trip);
  const takeoffDays = daysUntil(trip.start_date);
  const group = useMemo(
    () => [
      {
        id: String(trip.user_id || "me"),
        name: currentUserName,
        initials: toInitials(currentUserName),
        profileColor: "#32CD32",
        profilePic: null,
        active: true,
      },
    ],
    [trip.user_id, currentUserName]
  );

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)}>
      <Image
        source={trip.cover_photo_url ? { uri: trip.cover_photo_url } : FALLBACK_IMAGE}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={styles.cardImage}
      />

      <View style={[styles.subtitleRow, { position: "absolute", top: 10, right: 10 }]}> 
        <BlurView intensity={20} tint="default" style={styles.blurFill} />
        <MaterialCommunityIcons name="map-marker-outline" size={moderateScale(14)} color="white" />
        <Text style={styles.cardSubtitle}>{trip.destination}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{trip.title}</Text>

        <View style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar-today" size={moderateScale(14)} color={Colors.textSecondary} />
          <Text style={styles.dateRange}>
            {DateUtils.formatRange(
              DateUtils.parseYYYYMMDDToDate(trip.start_date),
              DateUtils.parseYYYYMMDDToDate(trip.end_date)
            )}
          </Text>
        </View>

        <View style={styles.progressHeader}>
          <Text style={[styles.progressText, { color: Colors.textSecondary }]}>Status</Text>
          <Text style={[styles.progressText, { color: Colors.primary }]}>
            {takeoffDays === 0 ? "Trip is starting" : `Takeoff in ${takeoffDays} day${takeoffDays === 1 ? "" : "s"}`}
          </Text>
        </View>

        <ProgressBar width="100%" height={moderateScale(8)} progress={`${percent}%`} backgroundColor="#F3F3F3" />
        <View style={styles.divider} />
        <GroupDisplay members={group} />

        <View style={styles.menuWrap}>
          <Menu>
            <MenuTrigger style={{ padding: 10 }}>
              <MaterialIcons name="more-vert" size={moderateScale(20)} color="grey" />
            </MenuTrigger>
            <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
              <MenuOption
                onSelect={() => onDelete(trip.id)}
                customStyles={{ optionWrapper: { padding: 10, flexDirection: "row", gap: 6, alignItems: "center" } }}
              >
                <MaterialIcons name="delete-outline" size={20} color="red" />
                <Text style={{ fontSize: moderateScale(14), color: "red", fontWeight: "600" }}>Delete</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Upcoming() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserName = user?.email?.split("@")[0] || "You";

  const loadTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUpcomingTrips(user.id);
      setTrips(data ?? []);
    } catch (error) {
      console.warn(error?.message || "Could not load trips");
      setTrips([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleDeleteTrip = (tripId) => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this upcoming trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await deleteTrip(user.id, tripId);
          if (error) {
            Alert.alert("Could not delete trip", error.message);
            return;
          }
          loadTrips();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (!trips.length) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Plan a New Adventure</Text>
          <AddTripButton />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {trips.map((trip) => (
        <UpcomingTripCard key={trip.id} trip={trip} currentUserName={currentUserName} onDelete={handleDeleteTrip} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    paddingTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    paddingTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: moderateScale(25),
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(5),
    elevation: 4,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 130 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 24, fontWeight: "bold", color: "black" },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.43)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    borderRadius: 20,
    paddingHorizontal: moderateScale(5),
    paddingVertical: moderateScale(4),
    gap: moderateScale(4),
    marginTop: 3,
    marginBottom: -2,
  },
  blurFill: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.38)",
    overflow: "hidden",
  },
  cardSubtitle: { fontSize: moderateScale(12), color: "white", fontWeight: "600" },
  progressText: { fontSize: 12, fontWeight: "600" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: moderateScale(6), marginTop: 10 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, marginBottom: 5 },
  dateRange: { color: Colors.textSecondaryDark, fontSize: moderateScale(12) },
  emptyBox: {
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    borderStyle: "dashed",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(30),
    justifyContent: "center",
    alignItems: "center",
  },
  divider: { width: "100%", height: 0.7, backgroundColor: "#CFCFCF", marginVertical: 20 },
  emptyText: { fontSize: moderateScale(18), color: Colors.textSecondary, marginBottom: 20 },
  menuOptionsContainer: { borderRadius: 10, padding: 5, width: 120, marginTop: 20 },
  menuWrap: { position: "absolute", top: 5, right: 3 },
});
