import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FriendsList({ buddies, onPressMore }) {
  const visible = buddies.slice(0, 4);
  const remaining = buddies.length - visible.length;

  return (
    <View>
      <Text style={styles.title}>Travel Buddies</Text>

      <View style={styles.row}>
        {visible.map((buddy, index) => (
          <Image
            key={buddy.id}
            source={{ uri: buddy.avatar }}
            style={[styles.avatar, index === 0 && styles.firstAvatar]}
          />
        ))}

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
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  // overlapping avatar
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
    marginLeft: -18, // overlap amount
  },

  // first avatar stays aligned
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
    marginLeft: -18, // match overlap
    borderWidth: 2,
    borderColor: "#fff",
  },

  moreText: {
    fontWeight: "700",
    color: "#4B5563",
  },
});