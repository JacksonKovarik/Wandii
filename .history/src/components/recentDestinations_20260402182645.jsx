import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RecentDestinations({ destinations, onPressMore }) {
  const recent = destinations.slice(0, 5);

  return (
    <View>
      {/* title + see all */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Destinations</Text>

        <TouchableOpacity onPress={onPressMore}>
          <Text style={styles.seeAll}>See All ›</Text>
        </TouchableOpacity>
      </View>

      {/* card list */}
      <View style={styles.list}>
        {recent.map((place, index) => {
          const [city, country] = place.split(", ");

          return (
            <View key={index} style={styles.card}>
              <Ionicons name="location-sharp" size={20} color="#FF8820" />

              <View style={{ marginLeft: 10 }}>
                <Text style={styles.city}>{city}</Text>
                <Text style={styles.country}>{country}</Text>
              </View>
            </View>
          );
        })}
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
    color: "#FF8820",
  },

  list: {
    marginTop: 4,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  city: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  country: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});