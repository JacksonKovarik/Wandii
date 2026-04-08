import FriendsList from "@/src/components/friendsList";
import ProfileHeader from "@/src/components/profileHeader";
import RecentDestinations from "@/src/components/recentDestinations";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  const recentDestinations = [
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "Rome, Italy",
    "Toronto, Canada",
    "London, UK",
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={user}
          photo={photo}
          initials={initials}
          onPressSettings={() => router.push("/settings")}
        />

        {/* Travel Buddies */}
        <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
          <FriendsList
            buddies={travelBuddies}
            onPressMore={() => router.push("/travel-buddies")}
          />
        </View>

        {/* Recent Destinations */}
        <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
          <RecentDestinations
            destinations={recentDestinations}
            onPressMore={() => router.push("/destinations")}
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  logoutContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  logoutButton: {
    backgroundColor: "#FF3B30", 
    paddingVertical: 10,        
    paddingHorizontal: 50,     
    borderRadius: 12,           
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 20,              
    fontWeight: "700",        
  },
});