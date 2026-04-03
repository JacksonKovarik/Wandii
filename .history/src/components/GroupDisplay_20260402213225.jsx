import { StyleSheet, Text, View } from "react-native";

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

export const GroupDisplay = ({ members }) => {
  const MAX_DISPLAY = 5;

  const visibleMembers = members.slice(0, MAX_DISPLAY);
  const remainingCount = members.length - MAX_DISPLAY;

  return (
    <View style={styles.container}>

      {/* Render first 4 normally */}
      {visibleMembers.slice(0, 4).map((member, index) => (
        <MemberIdentifier key={member.id} member={member} index={index} />
      ))}

      {/* 5th spot logic */}
      {members.length <= MAX_DISPLAY ? (
        // If 5 or fewer members → show the 5th normally
        visibleMembers[4] && (
          <MemberIdentifier
            member={visibleMembers[4]}
            index={4}
          />
        )
      ) : (
        // If more than 5 → show +X circle
        <View style={[styles.circleBase, styles.overlap, styles.overflowBackground]}>
          <Text style={styles.overflowText}>+{remainingCount}</Text>
        </View>
      )}

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
});