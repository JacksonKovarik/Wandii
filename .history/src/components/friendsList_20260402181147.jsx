// friendsList.jsx
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FriendsList({ buddies, onPressMore }) {
  const visible = buddies.slice(0, 4);
  const remaining = buddies.length - visible.length;

  return (
    <View>
      {/* title is now the button */}
      <TouchableOpacity onPress={onPressMore} style={styles.titleRow}>
        <Text style={styles.title}>Travel Buddies</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        {visible.map((buddy, index) => (
          <Image
            key={buddy.id}
            source={{ uri: buddy.avatar }}
            style={[styles.avatar, index === 0 && styles.firstAvatar]}
          />
        ))}

        {remaining > 0 && (
          <View style={styles.moreCircle}>
            <Text style={styles.moreText}>+{remaining}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
  },

  arrow: {
    fontSize: 20,
    color: "#4B5563",
    marginLeft: 6,
    marginTop: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
    marginLeft: -18,
  },

  firstAvatar: {
    marginLeft: 0,
  },

  moreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -18,
    borderWidth: 2,
    borderColor: "#fff",
  },

  moreText: {
    fontWeight: "700",
    color: "#4B5563",
  },
});