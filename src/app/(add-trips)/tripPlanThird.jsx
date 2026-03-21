import BudgetBar from "@/src/components/budgetBar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function TripPlanThird() {
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [budget, setBudget] = useState(0);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access photos is required.");
      return;
    }

    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!results.canceled) {
      setCoverPhoto(results.assets[0].uri);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={styles.header}>Final Touches</Text>
        <Text style={styles.subHeader}>Set the vibe for your adventure.</Text>

        <Text style={styles.label}>Cover Photo</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.uploadedImage} />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name="image-outline"
                size={moderateScale(40)}
                color="#9d9d9d"
              />
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Budget Estimation</Text>

        {/* This wrapper preserves the exact footprint of the old slider */}
        <View
          style={{
            width: moderateScale(355),
            height: verticalScale(40),
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          <BudgetBar value={budget} onChange={setBudget} />
        </View>

        <Text style={styles.label}>Trip Vibe</Text>
        <TouchableOpacity style={styles.vibeButton}>
          <Text style={styles.label}>Relaxing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <Link href="/(tabs)/(trips)/upcoming" replace asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Launch Adventure</Text>
          </TouchableOpacity>
        </Link>
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
    backgroundColor: "white",
    paddingVertical: verticalScale(20),
    borderRadius: moderateScale(10),
    alignItems: "center",
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
    marginBottom: 30,
  },

  buttonText: {
    color: "white",
    fontSize: moderateScale(18),
  },

  screen: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
    paddingTop: verticalScale(15),
    paddingHorizontal: 10,
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
