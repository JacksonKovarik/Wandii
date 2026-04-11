import DateUtils from "@/src/utils/DateUtils";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const PastTripCard = ({ trip }) => {
  const router = useRouter();

  const imageSource =
    typeof trip?.cover_photo_url === "string" && trip.cover_photo_url
      ? { uri: trip.cover_photo_url }
      : { uri: FALLBACK_IMAGE };

  const startDate = trip?.start_date ? DateUtils.parseYYYYMMDDToDate(trip.start_date) : null;
  const endDate = trip?.end_date ? DateUtils.parseYYYYMMDDToDate(trip.end_date) : null;

  // Formats to a cleaner string like "Oct 12 - Oct 18, 2023"
  const dateLabel =
    startDate && endDate
      ? DateUtils.formatRange(startDate, endDate)
      : endDate
      ? DateUtils.formatDate(endDate)
      : "Completed trip";

  return (
    // 1. Entire card routes to the Overview
    <TouchableOpacity 
        style={styles.cardContainer} 
        activeOpacity={0.85}
        onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)}
    >
      {/* Full-Bleed Background Image */}
      <Image 
        source={imageSource} 
        style={StyleSheet.absoluteFillObject} 
        contentFit="cover" 
        cachePolicy="memory-disk" 
      />

      {/* 2. Frosted Glass "Relive" Button (Routes to Story) */}
      <View style={styles.topRow}>
        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push(`/(trip-info)/${trip.id}/story`)}
            style={styles.reliveButtonWrapper}
        >
          {/* BlurView creates the beautiful iOS frosted glass effect */}
          <BlurView intensity={40} tint="light" style={styles.glassPill}>
            <Ionicons name="play" size={16} color="#FFFFFF" style={styles.playIcon} />
            <Text style={styles.reliveText}>Relive</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* 3. Warm Gradient for Text Contrast */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        style={styles.bottomGradient}
      />

      {/* 4. Memory Details */}
      <View style={styles.contentContainer}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={12} color="#FFB97A" />
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {trip?.title || "Untitled Trip"}
        </Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.locationText} numberOfLines={1}>
            {trip?.destination || "Unknown Location"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PastTripCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: verticalScale(240), // Makes it a beautiful, tall memory portrait
    borderRadius: scale(20),
    marginBottom: verticalScale(20),
    overflow: "hidden", // Keeps the image inside the rounded corners
    backgroundColor: "#E5E7EB", // Placeholder color while image loads
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  
  // --- Relive Button (Top Right) ---
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: scale(16),
    zIndex: 10,
  },
  reliveButtonWrapper: {
    borderRadius: scale(20),
    overflow: 'hidden', // Required for BlurView to have rounded corners
  },
  glassPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slight white tint to the glass
  },
  playIcon: {
    marginRight: scale(4),
  },
  reliveText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // --- Gradient & Text (Bottom) ---
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%", // Fades up smoothly from the bottom
    zIndex: 1,
  },
  contentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(20),
    zIndex: 10,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: verticalScale(8),
  },
  dateText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#FFB97A", // Warm golden color for nostalgia
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: verticalScale(6),
    lineHeight: moderateScale(30),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  locationText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
});