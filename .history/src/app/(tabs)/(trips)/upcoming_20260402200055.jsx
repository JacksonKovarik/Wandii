import { GroupDisplay } from "@/src/components/GroupDisplay";
import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { deleteTrip, getUpcomingTrips } from "@/src/lib/trips";
import DateUtils from "@/src/utils/DateUtils";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { moderateScale, verticalScale } from "react-native-size-matters";

const MOCK_TRIP_DATA = [
  {
    id: "trip-123",
    title: "Japan 2026",
    destinations: "Kyoto, Japan",
    start_date: "2024-10-12",
    end_date: "2024-10-24",
    image: require("../../../../assets/images/Kyoto.jpg"),
    readinessPercent: 60,
    group: [
      { id: 1, name: "Alice B.", initials: "AB", profileColor: "#1E90FF", active: false },
      { id: 2, name: "Hunter S.", initials: "HS", profileColor: "#32CD32", active: true },
      { id: 3, name: "Maria K.", initials: "MK", profileColor: "#FFA500", active: true },
    ],
  },
];

const UpcomingTripCard = ({ trip, onDelete }) => {
  const router = useRouter();
  const imageSource = typeof trip.image === "string" ? { uri: trip.image } : trip.image;
  const takeoffDays = DateUtils.daysUntil(DateUtils.parseYYYYMMDDToDate(trip.start_date));
  const percent = trip.readinessPercent ?? 60;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)}
    >
      <Image source={imageSource} contentFit="cover" cachePolicy="memory-disk" style={styles.cardImage} />

      <View style={[styles.subtitleRow, { position: "absolute", top: 10, right: 10 }]}>
        <BlurView
          intensity={20}
          tint="default"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.38)",
            overflow: "hidden",
          }}
        />
        <MaterialCommunityIcons name="map-marker-outline" size={moderateScale(14)} color="white" />
        <Text style={styles.cardSubtitle}>{trip.destinations}</Text>
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

        <ProgressBar
          width="100%"
          height={moderateScale(8)}
          progress={`${percent}%`}
          backgroundColor="#F3F3F3"
        />

        <View style={styles.divider} />

        <GroupDisplay members={trip.group || []} />

        <View style={styles.menuWrap}>
          <Menu>
            <MenuTrigger style={{ padding: 10 }}>
              <MaterialIcons name="more-vert" size={moderateScale(20)} color="grey" />
            </MenuTrigger>
            <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
              <MenuOption
                onSelect={() => onDelete(trip.id)}
                customStyles={{
                  optionWrapper: {
                    padding: 10,
                    flexDirection: "row",
                    gap: 6,
                    alignItems: "center",
                  },
                }}
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

  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

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
    } catch {
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
          if (!error) loadTrips();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tripId = "77777777-7777-7777-7777-777777777777";

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      {trips.length > 0 ? (
        trips.map((trip) => (
          <UpcomingTripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Plan a New Adventure</Text>

          <Link href={"/(add-trips)/tripPlanFirst"} push asChild>
            <TouchableOpacity
              style={{
                height: 50,
                width: 50,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#E5E7EB",
                borderRadius: 25,
              }}
            >
              <MaterialIcons name="add" size={30} color="#6B7280" />
            </TouchableOpacity>
          </Link>
        </View>
      )}

      <Link
        href={`/(trip-info)/${tripId}/overview`}
        style={{ marginTop: 20, alignSelf: "center" }}
      >
        <Text style={{ color: Colors.primary, fontWeight: "600" }}>View Trip Details</Text>
      </Link>
    </ScrollView>
  );
}
// styles
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  emptyBox: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#9d9d9d",
    borderStyle: "dashed",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  emptyText: {
    fontSize: moderateScale(18),
    color: "#9d9d9d",
    marginBottom: 20,
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
    backgroundColor: "rgba(0,0,0,0.43)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 20,
    paddingHorizontal: moderateScale(5),
    paddingVertical: moderateScale(4),
    gap: moderateScale(4),
  },

  cardSubtitle: {
    fontSize: moderateScale(12),
    color: "white",
    fontWeight: "600",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },

  dateRange: {
    color: Colors.textSecondaryDark,
    fontSize: moderateScale(12),
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  divider: {
    width: "100%",
    height: 0.7,
    backgroundColor: "#CFCFCF",
    marginVertical: 20,
  },

  menuWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  menuOptionsContainer: {
    borderRadius: 10,
    padding: 5,
    width: 120,
    marginTop: 20,
  },
});