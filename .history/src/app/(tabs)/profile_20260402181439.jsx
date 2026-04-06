// Profile.jsx
import FriendsList from "@/src/components/friendsList";
import RecentDestinations from "@/src/components/recentDestinations";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ProfilePage() {
  // example buddies
  const buddies = [
    { id: 1, avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, avatar: "https://i.pravatar.cc/150?img=5" },
  ];

  // example destinations
  const recentDestinations = [
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "Rome, Italy",
    "Toronto, Canada",
    "London, UK",
  ];

  function openBuddiesPage() {
    console.log("Open buddies page");
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* travel buddies */}
      <FriendsList buddies={buddies} onPressMore={openBuddiesPage} />

      {/* recent destinations */}
      <View style={{ marginTop: 30 }}>
        <RecentDestinations destinations={recentDestinations} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
});