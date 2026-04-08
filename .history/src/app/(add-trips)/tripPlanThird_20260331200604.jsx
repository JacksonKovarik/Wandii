import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

import { useAuth } from "@/src/context/AuthContext";
import { useTripDraft } from "@/src/context/TripDraftContext";
import { supabase } from "@/src/lib/supabase";

const vibeOptions = [
  "Relaxing",
  "Adventure",
  "Foodie",
  "Party",
  "Culture",
  "Road Trip",
];

async function uploadCoverPhotoIfNeeded(userId, coverPhotoUri) {
  if (!coverPhotoUri) return null;

  const resp = await fetch(coverPhotoUri);
  const blob = await resp.blob();

  const fileExt = coverPhotoUri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("trip-covers")
    .upload(fileName, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) throw uploadError;

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
    });

    if (!results.canceled) {
      setField("coverPhotoUri", results.assets[0].uri);
    }
  };

  async function onLaunchAdventure() {
    const { data: sessionData } = await supabase.auth.getSession();

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

    try {
      setBusy(true);

      const coverUrl = await uploadCoverPhotoIfNeeded(user.id, draft.coverPhotoUri);

      const { data: trip, error: tripError } = await supabase
        .from("Trips")
        .insert([
          {
            trip_name: draft.tripName,
            start_date: new Date(draft.startDate).toISOString(),
            end_date: new Date(draft.endDate).toISOString(),
            owner_id: user.id,
            destination_text: draft.destination,
            cover_photo_url: coverUrl,
            budget_estimate: draft.budget,
            vibe: draft.vibe,
          },
        ])
        .select()
        .single();

      if (tripError) throw tripError;

      const { error: memberError } = await supabase.from("Trip_Members").insert([
        {
          user_id: user.id,
          trip_id: trip.trip_id,
          role: "owner",
          status: "accepted",
        },
      ]);

      if (memberError) throw memberError;

      reset();
      router.replace("/(tabs)/(trips)/upcoming");
    } catch (e) {
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
            value={draft.budget}
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

  uploadBox: {
    width: 120,
    height: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: moderateScale(12),
    borderWidth: 2,
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

  budgetNote: {
    fontSize: moderateScale(11),
    color: "#c7c7c7",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 20,
  },
});