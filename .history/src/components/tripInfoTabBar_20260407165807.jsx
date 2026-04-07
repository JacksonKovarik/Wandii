import { useRouter, useSegments } from "expo-router";
import { useState } from "react";
import {
    LayoutAnimation,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "../constants/colors";

export default function TripInfoTabBar({ tripId }) {
  const segments = useSegments();
  const router = useRouter();

  const activeSegment = segments[segments.length - 1] || "overview";
  const isActive = (segment) => activeSegment === segment;

  const [labelWidths, setLabelWidths] = useState({});

  const tabs = [
    { name: "Overview", path: "overview", checkSegments: ["overview"] },
    {
      name: "Plan",
      path: "(plan)/idea-board",
      checkSegments: ["idea-board", "timeline", "map", "stays"],
    },
    { name: "Wallet", path: "wallet", checkSegments: ["wallet"] },
    { name: "Docs", path: "docs", checkSegments: ["docs"] },
    { name: "Memories", path: "memories", checkSegments: ["memories", "album"] },
    { name: "Chat", path: "chat", checkSegments: ["chat"] },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const active = tab.checkSegments.some(isActive);

          return (
            <TouchableOpacity
              key={tab.name}
              onLayout={(e) => {
                const width = e.nativeEvent.layout.width;
                setLabelWidths((prev) => ({ ...prev, [tab.name]: width }));
              }}
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                router.navigate(`/(trip-info)/${tripId}/${tab.path}`);
              }}
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

              {active && (
                <View
                  style={[
                    styles.tabUnderline,
                    { width: (labelWidths[tab.name] || 0) * 0.6 },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 65, 
    backgroundColor: "white",
    paddingHorizontal: "3%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },

  scrollContent: {
    alignItems: "center",
    flexDirection: "row",
  },

  tabButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  tabText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
  },

  tabUnderline: {
    height: 4, 
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 6, 
    alignSelf: "center",
  },
});