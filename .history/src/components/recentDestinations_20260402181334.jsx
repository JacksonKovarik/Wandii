import { StyleSheet, Text, View } from "react-native";

export default function RecentDestinations({ destinations }) {
  // only show the 5 most recent
  const recent = destinations.slice(0, 5);

  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Recent Destinations</Text>
        <Text style={styles.arrow}>›</Text>
      </View>

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

  list: {
    marginLeft: 4,
  },

  item: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 6,
  },
});