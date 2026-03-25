import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

import { useAuth } from "@/src/context/AuthContext";
import { useTripDraft } from "@/src/context/TripDraftContext";
import { supabase } from "@/src/lib/supabase";

async function uploadCoverPhotoIfNeeded(userId, coverPhotoUri) {
  if (!coverPhotoUri) return null;

  const fileExt = coverPhotoUri.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = fileExt === "png" ? "png" : fileExt === "webp" ? "webp" : "jpg";
  const fileName = `${userId}/${Date.now()}.${safeExt}`;

  const base64 = await FileSystem.readAsStringAsync(coverPhotoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const arrayBuffer = decode(base64);

  const contentType =
    safeExt === "png"
      ? "image/png"
      : safeExt === "webp"
        ? "image/webp"
        : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from("trip-covers")
    .upload(fileName, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("trip-covers").getPublicUrl(fileName);
  return data?.publicUrl ?? null;
}

export default function TripPlanThird() {
  const router = useRouter();
  const { user } = useAuth();
  const { draft, setField, reset } = useTripDraft();
  const [busy, setBusy] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Permission to access photos is required.");
      return;
    }

    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!results.canceled && results.assets?.[0]?.uri) {
      setField("coverPhotoUri", results.assets[0].uri);
    }
  };

  async function onLaunchAdventure() {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in first.");
      router.replace("/sign-in");
      return;
    }

    if (!draft.tripName || !draft.destination || !draft.startDate || !draft.endDate) {
      Alert.alert("Missing info", "Please fill Destination, Trip Name, and Dates on Step 1.");
      router.replace("/(add-trips)/tripPlanFirst");
      return;
    }

    try {
      setBusy(true);

      const coverUrl = await uploadCoverPhotoIfNeeded(user.id, draft.coverPhotoUri);

      const { error } = await supabase.from("trips").insert([
        {
          user_id: user.id,
          title: draft.tripName,
          destination: draft.destination,
          start_date: draft.startDate,
          end_date: draft.endDate,
          cover_photo_url: coverUrl,
          budget_estimate: draft.budget,
          vibe: draft.vibe,
        },
      ]);

      if (error) {
        throw error;
      }

      reset();
      router.replace("/(tabs)/(trips)/upcoming");
    } catch (e) {
      console.error("Could not create trip:", e);
      Alert.alert("Could not create trip", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={styles.header}>Final Touches</Text>
        <Text style={styles.subHeader}>Set the vibe for your adventure.</Text>

        <Text style={styles.label}>Cover Photo</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage} disabled={busy}>
          {draft.coverPhotoUri ? (
            <Image source={{ uri: draft.coverPhotoUri }} style={styles.uploadedImage} />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="image-outline" size={moderateScale(40)} color="#9d9d9d" />
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Budget Estimation: ${Math.round(draft.budget)}</Text>
        <View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={5000}
            step={50}
            minimumTrackTintColor="#FF8820"
            maximumTrackTintColor="#EBEBEB"
            tapToSeek
            thumbTintColor="#FF8820"
            value={draft.budget}
            onValueChange={(v) => setField("budget", v)}
            disabled={busy}
          />
        </View>

        <Text style={styles.label}>Trip Vibe</Text>
        <TouchableOpacity
          style={styles.vibeButton}
          onPress={() => setField("vibe", draft.vibe === "Relaxing" ? "Chaotic" : "Relaxing")}
          disabled={busy}
        >
          <Text style={styles.vibeText}>{draft.vibe}</Text>
        </TouchableOpacity>
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
  button: {
    width: "90%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: verticalScale(20),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  vibeButton: {
    width: "90%",
    backgroundColor: "#F3F4F6",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  vibeText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  bottomContainer: {
    width: "100%",
    height: "20%",
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
    marginTop: 10,
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
    fontSize: moderateScale(28),
    fontWeight: "700",
  },
  subHeader: {
    fontSize: moderateScale(15),
    marginBottom: 30,
    color: "#626262",
  },
  uploadBox: {
    width: 120,
    height: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginLeft: 10,
    marginTop: -15,
  },
  uploadText: {
    color: "#9d9d9d",
    fontSize: moderateScale(16),
    textAlign: "center",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(12),
  },
});