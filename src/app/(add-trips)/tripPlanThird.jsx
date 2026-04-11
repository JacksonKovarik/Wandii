import { useAuth } from "@/src/context/AuthContext";
import { useTripDraft } from "@/src/context/TripDraftContext";
import { supabase } from "@/src/lib/supabase";
import { createTrip } from "@/src/lib/trips";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const vibeOptions = [
  "Relaxing",
  "Adventure",
  "Foodie",
  "Party",
  "Culture",
  "Road Trip",
];

// 5 Stunning Default Images
const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80", // Airplane Window
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80", // Van/Roadtrip
  "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=600&q=80", // Map/Compass
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80", // Mountain/Lake
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"  // Beach
];

async function uploadCoverPhotoIfNeeded(userId, coverPhotoUri) {
  if (!coverPhotoUri) return null;

  const fileExt =
    coverPhotoUri?.split(".").pop()?.toLowerCase()?.split("?")[0] || "jpg";

  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const base64 = await FileSystem.readAsStringAsync(coverPhotoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const contentType =
    fileExt === "png"
      ? "image/png"
      : fileExt === "webp"
      ? "image/webp"
      : "image/jpeg";

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("trip-covers")
    .upload(fileName, decode(base64), {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("trip-covers")
    .getPublicUrl(uploadData.path);

  return publicUrlData?.publicUrl ?? null;
}

export default function TripPlanThird() {
  const router = useRouter();
  const { user } = useAuth();
  const { draft, setField, reset } = useTripDraft();

  const [busy, setBusy] = useState(false);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Permission to access photos is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setField("coverPhotoUri", result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Image error", error?.message || "Could not pick image.");
    }
  };

  async function onLaunchAdventure() {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in first.");
      router.replace("/sign-in");
      return;
    }

    if (!draft.tripName || !draft.destination || !draft.startDate || !draft.endDate) {
      Alert.alert("Missing info", "Please fill Destination, Trip Name, and Dates.");
      router.replace("/(add-trips)/tripPlanFirst");
      return;
    }

    // NEW: Require Cover Photo Validation
    if (!draft.coverPhotoUri) {
      Alert.alert("Cover Photo Required", "Please select a preset image or upload your own to continue.");
      return;
    }

    try {
      setBusy(true);

      let finalCoverUrl = draft.coverPhotoUri;

      // NEW: Only upload to storage if it's a local file (doesn't start with http)
      if (!finalCoverUrl.startsWith('http')) {
        finalCoverUrl = await uploadCoverPhotoIfNeeded(user.id, draft.coverPhotoUri);
      }

      const { error } = await createTrip({
        userId: user.id,
        title: draft.tripName,
        destination: draft.destination,
        startDate: draft.startDate,
        endDate: draft.endDate,
        coverPhotoUrl: finalCoverUrl, // Send the final URL straight to DB
        budgetEstimate: draft.budget,
        vibe: draft.vibe,
        memberIds: draft.invitedConnectionIds,
      });

      if (error) {
        throw error;
      }

      reset();
      router.replace("/(tabs)/(trips)/upcoming");
    } catch (e) {
      Alert.alert("Could not create trip", e?.message || "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={styles.header}>Final Touches</Text>
        <Text style={styles.subHeader}>Set the vibe for your adventure.</Text>

        <Text style={styles.label}>Cover Photo (Required)</Text>

        {/* NEW: Horizontal Image Selection */}
        <View style={{ height: verticalScale(100), marginBottom: 20, marginTop: -10 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.imageScrollContainer}
          >
            {/* Custom Upload Button */}
            <TouchableOpacity 
              style={[styles.presetBox, styles.uploadBox]} 
              onPress={pickImage} 
              disabled={busy}
            >
              <Ionicons name="camera-outline" size={moderateScale(28)} color="#9d9d9d" />
              <Text style={styles.uploadText}>Custom</Text>
            </TouchableOpacity>

            {/* If user uploaded a custom photo, show it first */}
            {draft.coverPhotoUri && !draft.coverPhotoUri.startsWith('http') && (
              <View style={[styles.presetBox, styles.selectedBorder]}>
                <Image source={{ uri: draft.coverPhotoUri }} style={styles.presetImg} />
                <View style={styles.selectedOverlay}>
                  <Ionicons name="checkmark-circle" size={24} color="#FF8820" />
                </View>
              </View>
            )}

            {/* The 5 Presets */}
            {PRESET_IMAGES.map((url, index) => {
              const isSelected = draft.coverPhotoUri === url;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.presetBox, isSelected && styles.selectedBorder]} 
                  onPress={() => setField("coverPhotoUri", url)}
                  disabled={busy}
                >
                  <Image source={{ uri: url }} style={styles.presetImg} />
                  {isSelected && (
                    <View style={styles.selectedOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color="#FF8820" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Text style={styles.label}>Budget Estimation: ${Math.round(draft.budget || 0)}</Text>

        <View style={{ marginTop: -20, marginBottom: -5 }}>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={5000}
            step={50}
            minimumTrackTintColor="#FF8820"
            maximumTrackTintColor="#EBEBEB"
            tapToSeek
            thumbTintColor="#FF8820"
            value={Number(draft.budget || 0)}
            onValueChange={(v) => setField("budget", v)}
            disabled={busy}
          />
        </View>

        <Text style={styles.budgetNote}>You can adjust this later in the budget section.</Text>

        <Text style={styles.label}>Trip Vibe</Text>

        <View style={styles.vibeContainer}>
          {vibeOptions.map((v) => {
            const isSelected = draft.vibe === v;

            return (
              <TouchableOpacity
                key={v}
                style={[styles.vibeButton, isSelected && styles.vibeButtonSelected]}
                onPress={() => setField("vibe", isSelected ? null : v)}
                disabled={busy}
              >
                <Text style={[styles.vibeText, isSelected && styles.vibeTextSelected]}>
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, busy && { opacity: 0.6 }]}
          onPress={onLaunchAdventure}
          disabled={busy}
        >
          <Text style={styles.buttonText}>{busy ? "Saving..." : "Launch Adventure"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  button: {
    width: "90%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  vibeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 20,
    marginTop: -10,
  },
  vibeButton: {
    width: "31%",
    paddingVertical: verticalScale(8),
    backgroundColor: "#F3F4F6",
    borderRadius: moderateScale(8),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CFCFCF",
  },
  vibeButtonSelected: {
    backgroundColor: "rgba(255, 122, 0, 0.25)",
    borderColor: "#FF8820",
    borderWidth: 2,
  },
  vibeText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#9d9d9d",
  },
  vibeTextSelected: {
    color: "#FF8820",
  },
  bottomContainer: {
    width: "100%",
    height: "22%",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#d9d9d9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  label: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#9d9d9d",
    marginTop: 15,
    marginBottom: 18,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: moderateScale(18),
  },
  screen: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 15,
  },
  header: {
    marginTop: -15,
    fontSize: moderateScale(28),
    fontWeight: "700",
  },
  subHeader: {
    fontSize: moderateScale(15),
    marginBottom: 20,
    color: "#626262",
  },
  budgetNote: {
    fontSize: moderateScale(11),
    color: "#c7c7c7",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 20,
  },

  // NEW STYLES FOR IMAGE SCROLL
  imageScrollContainer: {
    gap: scale(10),
    alignItems: 'center',
    paddingRight: 20, // Breathing room at the end
  },
  presetBox: {
    width: scale(90),
    height: verticalScale(90),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
  },
  presetImg: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(8),
  },
  uploadBox: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  uploadText: {
    color: "#9d9d9d",
    fontSize: moderateScale(13),
    fontWeight: "600",
    marginTop: 4,
  },
  selectedBorder: {
    borderColor: "#FF8820",
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(8),
  },
});