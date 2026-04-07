import { useRouter, useSegments } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "../constants/colors";

export default function TripInfoTabBar({ tripId }) {
    const segments = useSegments();
    const router = useRouter();

    const activeSegment = segments[segments.length - 1] || "overview";
    const isActive = (segment) => activeSegment === segment;

    // Updated tabs list with Chat added
    const tabs = [
        { name: "Overview", path: "overview", checkSegments: ["overview"] },
        { name: "Plan", path: "(plan)/idea-board", checkSegments: ["idea-board", "timeline", "map", "stays"] },
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
                            onPress={() =>
                                router.navigate(`/(trip-info)/${tripId}/${tab.path}`)
                            }
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "22%",
        backgroundColor: "white",
        paddingHorizontal: "3%",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 3,
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
        paddingHorizontal: 10, 
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