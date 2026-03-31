
import PastTripCard from "@/src/components/pastTripCard"; // or rename to TripCard
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
  const trips = [
  {
    location: "Kyoto, Japan",
    dates: "Apr 3 - Apr 12, 2026",
    photos: 42,
    journals: 5,
    image: JapanImage,
  },

  {
    location: "Paris, France",
    dates: "Mar 10 - Mar 18, 2025",
    photos: 87,
    journals: 3,
    image: ParisImage,
  },
];

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <PastTripCard trip={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTrips}>{loading ? "Loading..." : "No Trips Found..."}</Text>
          </View>
        )}
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContainer: {
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTrips: {
    fontSize: moderateScale(30),
    opacity: 0.4,
    color: "#9D9D9D",
  },

  emptyImage: {
    width: scale(150),
    height: verticalScale(150),
    marginBottom: verticalScale(20),
  },
});
