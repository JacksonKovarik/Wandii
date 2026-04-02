import SettingsHeader from "@/src/components/settingsHeader";
import { supabase } from "@/src/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function EditProfilePage() {
  // Profile fields
  const [name, setName] = useState("Shelby Wood");
  const [username, setUsername] = useState("shelbywood");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Generate initials from name
  function getInitials(name) {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  const initials = getInitials(name);

  // Load signed-in user's email
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setEmail(user.email);
    }
    loadUser();
  }, []);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  return (
    <View style={styles.container}>
      {/* STATIC HEADER WITH BUILT-IN DIVIDER */}
      <SettingsHeader
        title="Edit Profile"
        photo={photo}
        initials={initials}
        onPickImage={pickImage}
      />

      {/* SCROLLABLE CONTENT WITH KEYBOARD DISMISS */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* Form */}
            <View style={styles.form}>
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Change Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
              </View>

              {/* Username */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Change Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter a username"
                  autoCapitalize="none"
                />
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Change Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Section */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  secureTextEntry
                />
              </View>

              {/* Inline validation */}
              {newPassword !== "" &&
                confirmPassword !== "" &&
                newPassword !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 40, 
  },

  form: {
    marginTop: 10,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  errorText: {
    color: "#D9534F",
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 35,
    backgroundColor: "#FF8820",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});