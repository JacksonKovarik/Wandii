import { UpcomingTripCard } from "@/src/components/upcomingTripCard";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { getUpcomingTrips } from "@/src/lib/trips";
import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

// main screen
export default function Upcoming() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // load trips
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

  // loading state
  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {trips.length > 0 ? (
        trips.map((trip) => (
          <UpcomingTripCard key={trip.id} trip={trip} userId={user.id} />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Plan a New Adventure</Text>

          {/* lighter add button with navigation */}
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
});