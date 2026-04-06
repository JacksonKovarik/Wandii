import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsHeader({ title, photo, initials, onPickImage }) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>

      {/* cancel above the title */}
      <View style={styles.cancelRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* title centered below cancel */}
      <Text style={styles.title}>{title}</Text>

      {/* avatar */}
      <TouchableOpacity onPress={onPickImage} style={styles.avatarWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* change photo link */}
      <TouchableOpacity onPress={onPickImage}>
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      {/* divider */}
      <View style={styles.bottomDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },

  cancelRow: {
    width: "100%",
    alignItems: "flex-end",
    paddingRight: 20,
    marginBottom: 6,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9d9d9d",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },

  avatarWrapper: {
    marginBottom: 4,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  placeholderAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FF8820",
    justifyContent: "center",
    alignItems: "center",
  },

  initials: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
  },

  changePhoto: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 2,
  },

  bottomDivider: {
    width: "100%",
    height: 1.5,
    backgroundColor: "#D1D5DB",
    marginTop: 12,
  },
});