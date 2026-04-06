import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function UpcomingTripCard({ trip, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>

      {/* Thin full-width top image */}
      <Image
        source={trip.image}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      {/* Content below the image */}
      <View style={styles.content}>

        {/* Location + countdown pill */}
        <View style={styles.headerRow}>
          <Text style={styles.location}>{trip.location}</Text>

          <View style={styles.countdownPill}>
            <Ionicons
              name="time-outline"
              size={moderateScale(12)}
              color="#FF5900"
              style={{ marginRight: scale(4) }}
            />
            <Text style={styles.countdownText}>{trip.daysLeft} days</Text>
          </View>
        </View>

        {/* Trip dates */}
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={moderateScale(18)}
            color="#9d9d9d"
            style={{ marginRight: scale(6) }}
          />
          <Text style={styles.dates}>{trip.dates}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: scale(16),
    marginBottom: verticalScale(25),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(5),
    elevation: 4,
    overflow: "hidden",
  },

  // Thin banner image (best quality)
  bannerImage: {
    width: "100%",
    height: verticalScale(65), // thin but still crisp
  },

  content: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  location: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    flexShrink: 1,
    marginRight: scale(10),
  },

  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: scale(8),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: "#FF5900",
  },

  countdownText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#FF5900",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(10),
  },

  dates: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#9d9d9d",
  },
});