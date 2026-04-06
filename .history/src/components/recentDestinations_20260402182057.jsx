// RecentDestinations.jsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RecentDestinations({ destinations, onPressMore }) {
  const recent = destinations.slice(0, 5);

  return (
    <View>
      {/* title + see all button */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Destinations</Text>

        <TouchableOpacity onPress={onPressMore}>
          <Text style={styles.seeAll}>See All ›</Text>
        </TouchableOpacity>
      </View>

      {/* list */}
      <View style={styles.list}>
        {recent.map((place, index) => (
          <Text key={index} style={styles.item}>
            • {place}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
  },

  seeAll: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },

  list: {
    marginLeft: 4,
  },

  item: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 6,
  },
});