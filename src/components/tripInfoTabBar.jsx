import { useRouter, useSegments } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "../constants/colors";

export default function TripInfoTabBar({ tripId }) {
  const router = useRouter();
  const segments = useSegments();

  const isActive = (checkSegments) =>
    checkSegments.some((segment) => segments.includes(segment));

  const tabs = [
    { name: "Overview", path: "overview", checkSegments: ["overview"] },
    { name: "Plan", path: "(plan)/idea-board", checkSegments: ["idea-board", "timeline", "map", "stays"] },
    { name: "Wallet", path: "wallet", checkSegments: ["wallet"] },
    { name: "Docs", path: "docs", checkSegments: ["docs"] },
    { name: "Chat", path: "chat", checkSegments: ["chat"] },
    { name: "Memories", path: "memories", checkSegments: ["memories", "album"] },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const active = isActive(tab.checkSegments);
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => router.navigate(`/(trip-info)/${tripId}/${tab.path}`)}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.name}</Text>
            {active && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    width: "100%",
    height: moderateScale(50),
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: moderateScale(10),
  },
  tabButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  tabText: {
    marginTop: "auto",
    fontSize: moderateScale(13),
    fontWeight: "bold",
    color: Colors.textSecondaryDark,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabUnderline: {
    width: "100%",
    height: moderateScale(3),
    backgroundColor: Colors.primary,
    borderTopLeftRadius: moderateScale(3),
    borderTopRightRadius: moderateScale(3),
    marginTop: "auto",
  },
});
