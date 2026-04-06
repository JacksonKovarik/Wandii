import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReusableTabBar({ tabs }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname.includes(tab.name);

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.route)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "90%",          // ensures consistent width
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },

  tab: {
    flex: 1,               // ⭐ EXACT equal width
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },

  activeTab: {
    backgroundColor: "#FF8820",   // full width highlight
  },

  activeLabel: {
    color: "white",
    fontWeight: "700",
  },
});
