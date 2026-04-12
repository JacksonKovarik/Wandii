import { Colors } from "@/src/constants/colors";
import { useRouter, useSegments } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function TripInfoTabBar({ tripId }) {
  const segments = useSegments();
  const router = useRouter();

  const activeSegment = segments[segments.length - 1] || "overview";
  const isActive = (tabName) => activeSegment === tabName;

  const tabs = [
    { name: "Overview", path: "overview", checkSegments: ["overview"] },
    { name: "Plan", path: "(plan)/idea-board", checkSegments: ["idea-board", "timeline", "map", "stays"] },
    { name: "Wallet", path: "wallet", checkSegments: ["wallet"] },
    { name: "Docs", path: "docs", checkSegments: ["docs"] },
    { name: "Memories", path: "memories", checkSegments: ["memories", "album"] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent} >
        {tabs.map((tab) => {
          const active = tab.checkSegments.some(isActive);

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.navigate(`/(trip-info)/${tripId}/${tab.path}`)}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? Colors.primary : Colors.textSecondary },
                ]}
              >
                {tab.name}
              </Text>

              <View
                style={[
                  styles.tabUnderline,
                  { backgroundColor: active ? Colors.primary : "transparent" },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    paddingHorizontal: "5%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },

  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  tabButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 3,
  },

  tabText: {
    marginTop: "auto",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },

  tabUnderline: {
    height: 3,
    width: "80%",
    marginTop: "auto",
    borderRadius: 2,
  },
});