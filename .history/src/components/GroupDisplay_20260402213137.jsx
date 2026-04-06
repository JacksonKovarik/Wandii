import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MemberIdentifier = ({ member, index }) => {
  return (
    <View
      style={[
        styles.circleBase,
        index > 0 && styles.overlap
      ]}
    >
      <Text style={styles.text}>{member.id}</Text>
    </View>
  );
};

export const GroupDisplay = ({ members, onAddPress }) => {
  const MAX_DISPLAY = 4;
  const visibleMembers = members.slice(0, MAX_DISPLAY);
  const remainingCount = members.length - MAX_DISPLAY;

  return (
    <View style={styles.container}>

      {/* Visible members */}
      {visibleMembers.map((member, index) => (
        <MemberIdentifier key={member.id} member={member} index={index} />
      ))}

      {/* +X overflow */}
      {remainingCount > 0 && (
        <View style={[styles.circleBase, styles.overlap, styles.overflowBackground]}>
          <Text style={styles.overflowText}>+{remainingCount}</Text>
        </View>
      )}

      {/* + Add User Button */}
      <TouchableOpacity
        style={[styles.circleBase, styles.overlap, styles.addButton]}
        onPress={onAddPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={22} color="#6B7280" />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  circleBase: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },

  overlap: {
    marginLeft: -12,
  },

  overflowBackground: {
    backgroundColor: "#333333",
  },

  text: {
    color: "white",
  },

  overflowText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  addButton: {
    backgroundColor: "#E5E7EB", // light gray
    borderColor: "white",
  },
});