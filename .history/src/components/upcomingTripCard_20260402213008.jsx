import { GroupDisplay } from "@/src/components/GroupDisplay";
import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function UpcomingTripCard({ trip, onDelete }) {
  const imageSource =
    typeof trip.image === "string" ? { uri: trip.image } : trip.image;

  // ✅ Correct DateUtils function
  const takeoffDays = DateUtils.calculateDaysUntil(trip.start_date);

  const percent = trip.readinessPercent ?? 60;

  return (
    <Link href={`/(trip-info)/${trip.id}/overview`} asChild>
      <TouchableOpacity style={styles.card}>

        {/* Banner image */}
        <Image
          source={imageSource}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.cardImage}
        />

        {/* COUNTDOWN PILL — top right */}
        <View style={styles.countdownPillWrap}>
          <View style={styles.countdownPill}>
            <Ionicons
              name="time-outline"
              size={moderateScale(12)}
              color="#FF5900"
              style={{ marginRight: scale(4) }}
            />
            <Text style={styles.countdownText}>{takeoffDays} days</Text>
          </View>
        </View>

        {/* LOCATION TAG — top left */}
        <View style={styles.locationTag}>
          <BlurView intensity={20} tint="default" style={styles.locationBlur} />
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={moderateScale(14)}
            color="white"
          />
          <Text style={styles.locationText}>{trip.destinations}</Text>
        </View>

        {/* CARD CONTENT */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{trip.title}</Text>

          {/* Date range */}
          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={moderateScale(14)}
              color={Colors.textSecondary}
            />
            <Text style={styles.dateRange}>
              {DateUtils.formatRange(
                DateUtils.parseYYYYMMDDToDate(trip.start_date),
                DateUtils.parseYYYYMMDDToDate(trip.end_date)
              )}
            </Text>
          </View>

          {/* Status */}
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
              Status
            </Text>
            <Text style={[styles.progressText, { color: Colors.primary }]}>
              {takeoffDays === 0
                ? "Trip is starting"
                : `Takeoff in ${takeoffDays} day${takeoffDays === 1 ? "" : "s"}`}
            </Text>
          </View>

          {/* Progress bar */}
          <ProgressBar
            width="100%"
            height={moderateScale(8)}
            progress={`${percent}%`}
            backgroundColor="#F3F3F3"
          />

          <View style={styles.divider} />

          {/* Group avatars */}
          <GroupDisplay members={trip.group || []} />

          {/* Menu icon (not interactive here) */}
          <View style={styles.menuWrap}>
            <MaterialIcons name="more-vert" size={moderateScale(20)} color="grey" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
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

  cardImage: {
    width: "100%",
    height: verticalScale(65), // thin banner
  },

  /* COUNTDOWN PILL */
  countdownPillWrap: {
    position: "absolute",
    top: verticalScale(10),
    right: scale(10),
    zIndex: 20,
  },

  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: scale(10),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: "#FF5900",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  countdownText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#FF5900",
  },

  /* LOCATION TAG */
  locationTag: {
    position: "absolute",
    top: verticalScale(10),
    left: scale(10),
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: scale(20),
    overflow: "hidden",
  },

  locationBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: scale(20),
    backgroundColor: "rgba(255,255,255,0.38)",
  },

  locationText: {
    color: "white",
    fontSize: moderateScale(12),
    marginLeft: scale(4),
    fontWeight: "600",
  },

  /* CONTENT */
  cardContent: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
  },

  cardTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: verticalScale(6),
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
    gap: 6,
  },

  dateRange: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(6),
  },

  progressText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: verticalScale(12),
  },

  menuWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});