import FriendsList from "@/src/components/friendsList";
import ProfileHeader from "@/src/components/profileHeader";
import RecentDestinations from "@/src/components/RecentDestinations";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();

  const [photo, setPhoto] = useState(null);

  // temporary user data
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

  // recent destinations (example)
  const recentDestinations = [
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "Rome, Italy",
    "Toronto, Canada",
    "London, UK",
  ];

  // initials
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <ProfileHeader
        user={user}
        photo={photo}
        initials={initials}
        onPressSettings={() => router.push("/settings")}
      />

      {/* travel buddies */}
      <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
        <FriendsList buddies={travelBuddies} />
      </View>

      {/* recent destinations */}
      <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
        <RecentDestinations destinations={recentDestinations} />
      </View>

      {/* logout */}
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