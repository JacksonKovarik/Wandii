import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsHeader({ title, photo, initials, onPickImage }) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
   
      <View style={styles.topRow}>
        <View style={{ width: 60 }} />

        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelWrapper}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

     
      <TouchableOpacity onPress={onPickImage} style={styles.avatarWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
      </TouchableOpacity>

    
      <TouchableOpacity onPress={onPickImage}>
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

    
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

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10, // reduced spacing BELOW title only
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  cancelWrapper: {
    width: 60,
    alignItems: "flex-end",
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9d9d9d",
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