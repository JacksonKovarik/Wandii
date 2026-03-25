import PastTripCard from "@/src/components/pastTripCard";
import ReliveStoryViewer from "@/src/components/ReliveStoryViewer";
import { useAuth } from "@/src/context/AuthContext";
import { getPastTrips } from "@/src/lib/trips";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const FALLBACK_IMAGE = require("../../../../assets/images/paris.png");

function formatShortRange(startDate, endDate) {
  const start = startDate ? new Date(`${startDate}T12:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T12:00:00`) : null;
  const fmt = (date) =>
    date
      ? date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function Past() {
  const { user } = useAuth();
  const [activeStoryTrip, setActiveStoryTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getPastTrips(user.id);
      setTrips(
        (data ?? []).map((trip) => ({
          id: String(trip.id),
          name: trip.title,
          location: trip.destination,
          dates: formatShortRange(trip.start_date, trip.end_date),
          photos: 0,
          journals: 0,
          image: trip.cover_photo_url ? { uri: trip.cover_photo_url } : FALLBACK_IMAGE,
          memories: [],
        }))
      );
    } catch (error) {
      console.warn(error?.message || "Could not load past trips");
      setTrips([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const openTripMemories = (trip) => {
    if (!trip.memories?.length) {
      Alert.alert("No memories yet", "This trip doesn’t have saved memories yet.");
      return;
    }
    setActiveStoryTrip(trip);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PastTripCard trip={item} onRelivePress={() => openTripMemories(item)} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTrips}>{loading ? "Loading..." : "No Trips Found..."}</Text>
          </View>
        )}
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.listContainer}
      />

      <Modal
        visible={activeStoryTrip !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveStoryTrip(null)}
      >
        {activeStoryTrip && (
          <ReliveStoryViewer trip={activeStoryTrip} onClose={() => setActiveStoryTrip(null)} />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { paddingTop: verticalScale(20), paddingHorizontal: scale(20) },
  emptyContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  emptyContent: { justifyContent: "center", alignItems: "center" },
  emptyTrips: { fontSize: moderateScale(30), opacity: 0.4, color: "#9D9D9D" },
});
