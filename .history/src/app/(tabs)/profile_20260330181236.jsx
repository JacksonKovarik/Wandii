import FriendsList from "@/src/components/friendsList";
import ProfileHeader from "@/src/components/profileHeader";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();

  const [photo, setPhoto] = useState(null);


  const user = {
    name: "Shelby Wood",
    username: "shelbywood",
    trips: 12,
    buddies: 12,
    countries: 3,
  };

  const travelBuddies = [
    { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Jordan", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Taylor", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "Riley", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Casey", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 6, name: "Morgan", avatar: "https://i.pravatar.cc/150?img=6" },
    { id: 7, name: "Jamie", avatar: "https://i.pravatar.cc/150?img=7" },
    { id: 8, name: "Chris", avatar: "https://i.pravatar.cc/150?img=8" },
  ];

  // Pick an image
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

  // Create initials safely
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  return (
    <View style={styles.screen}>
      <ProfileHeader
        user={user}
        photo={photo}
        initials={initials}
        onPressSettings={() => router.push("/settings")}
      />

      <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
        <FriendsList buddies={travelBuddies} />
      </View>

      <View style={{ marginTop: 40, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={handleLogout} style={{ paddingVertical: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#D9534F" }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
});