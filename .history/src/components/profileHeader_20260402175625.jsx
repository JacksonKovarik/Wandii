import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function ProfileHeader({
  user,
  photo,
  initials,
  onPressSettings,
}) {
  return (
    <View style={styles.container}>
      {/* top row */}
      <View style={styles.headerRow}>
        <View style={styles.sideWrapperLeft} />

        <View style={styles.middleWrapper} />

        {/* settings button */}
        <View style={styles.sideWrapperRight}>
          <TouchableOpacity onPress={onPressSettings} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* main profile content */}
      <View style={styles.profileContent}>
        {/* avatar and name */}
        <View style={styles.avatarRow}>
          {/* avatar is no longer a button */}
          <View>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
          </View>

          {/* name and username */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{user?.name || ""}</Text>

            {user?.username ? (
              <Text style={styles.username}>@{user.username}</Text>
            ) : null}
          </View>
        </View>

        {/* divider */}
        <View style={styles.innerDivider} />

        {/* counters */}
        <View style={styles.countersRow}>
          <View style={styles.counterBox}>
            <Text style={styles.counterNumber}>{user?.trips ?? 0}</Text>
            <Text style={styles.counterLabel}>Trips</Text>
          </View>

          <View style={styles.counterBox}>
            <Text style={styles.counterNumber}>{user?.buddies ?? 0}</Text>
            <Text style={styles.counterLabel}>Travel{"\n"}Buddies</Text>
          </View>

          <View style={styles.counterBox}>
            <Text style={styles.counterNumber}>{user?.countries ?? 0}</Text>
            <Text style={styles.counterLabel}>Countries</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },

  sideWrapperLeft: {
    width: 60,
    alignItems: "flex-end",
  },

  sideWrapperRight: {
    width: 100,
    alignItems: "flex-end",
    marginRight: -10,
  },

  middleWrapper: {
    flex: 1,
    alignItems: "center",
  },

  settingsButton: {
    padding: 6,
  },

  settingsIcon: {
    fontSize: 26,
    color: "#444",
  },

  profileContent: {
    marginTop: -15,
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  initialsAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FF8820",
    justifyContent: "center",
    alignItems: "center",
  },

  initialsText: {
    fontSize: moderateScale(32),
    fontWeight: "700",
    color: "white",
  },

  infoContainer: {
    marginLeft: 20,
  },

  name: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#000",
  },

  username: {
    fontSize: moderateScale(16),
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },

  innerDivider: {
    height: 1.5,
    backgroundColor: "#CFCFCF",
    width: "100%",
    marginBottom: 18,
  },

  countersRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 10,
  },

  counterBox: {
    flex: 1,
    alignItems: "center",
    minHeight: 55,
  },

  counterNumber: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  counterLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
    lineHeight: 16,
  },
});