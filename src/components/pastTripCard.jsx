import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const PastTripCard = ({ trip, onRelivePress }) => {
  const imageSource =
    typeof trip?.cover_photo_url === "string" && trip.cover_photo_url
      ? { uri: trip.cover_photo_url }
      : { uri: FALLBACK_IMAGE };

  const startDate = trip?.start_date ? DateUtils.parseYYYYMMDDToDate(trip.start_date) : null;
  const endDate = trip?.end_date ? DateUtils.parseYYYYMMDDToDate(trip.end_date) : null;

  const dateLabel =
    startDate && endDate
      ? DateUtils.formatRange(startDate, endDate)
      : endDate
      ? DateUtils.formatDate(endDate)
      : "Completed trip";

  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.coverImage} contentFit="cover" cachePolicy="memory-disk" />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.locationPill}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors.primary} />
            <Text style={styles.locationPillText} numberOfLines={1}>
              {trip?.destination || "Past trip"}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {trip?.title || "Untitled Trip"}
        </Text>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.dates}>{dateLabel}</Text>
        </View>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, styles.memoryBadge]}>
            <Ionicons name="images-outline" size={12} color="#7C3AED" />
            <Text style={[styles.badgeText, { color: "#7C3AED" }]}>Memories</Text>
          </View>

          <View style={[styles.badge, styles.completedBadge]}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#0EA5A5" />
            <Text style={[styles.badgeText, { color: "#0EA5A5" }]}>Completed</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.reliveButton} onPress={onRelivePress} activeOpacity={0.85}>
          <Text style={styles.reliveText}>Relive Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PastTripCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: scale(22),
    marginBottom: verticalScale(20),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  coverImage: {
    width: "100%",
    height: verticalScale(180),
  },
  content: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#FFF4E8",
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    maxWidth: "100%",
  },
  locationPillText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: moderateScale(12),
    flexShrink: 1,
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  dates: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginTop: verticalScale(14),
    marginBottom: verticalScale(16),
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  memoryBadge: {
    backgroundColor: "#F3E8FF",
  },
  completedBadge: {
    backgroundColor: "#DFF9F6",
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  reliveButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
  },
  reliveText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#111827",
  },
});
