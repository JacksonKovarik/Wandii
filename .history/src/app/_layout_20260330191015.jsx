// friendsList.jsx
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FriendsList({ buddies, onPressMore }) {
  // show only the first 4 buddies
  const visible = buddies.slice(0, 4);

  // how many buddies remain
  const remaining = buddies.length - visible.length;

  return (
    <View>
      {/* section title */}
      <Text style={styles.title}>Travel Buddies</Text>

      {/* avatar row */}
      <View style={styles.row}>
        {visible.map((buddy) => (
          <Image
            key={buddy.id}
            source={{ uri: buddy.avatar }}
            style={styles.avatar}
          />
        ))}

        {/* +X circle */}
        {remaining > 0 && (
          <TouchableOpacity onPress={onPressMore}>
            <View style={styles.moreCircle}>
              <Text style={styles.moreText}>+{remaining}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,          
    fontWeight: "600",
    color: "#4B5563",      
    marginBottom: 12,
    fontStyle:"bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  moreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    fontWeight: "700",
    color: "#4B5563",
  },
});
