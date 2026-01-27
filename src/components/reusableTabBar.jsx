import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";

export default function ReusableTabBar({ tabs, extraBgStyle, extraTextStyle }) {
    const route = useRoute();
    const router = useRouter();

    const isActive = (tabName) => route.name === tabName;

    return (
        <View style={[styles.container, extraBgStyle]}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.route}
                    onPress={() => router.navigate(tab.route)}
                    style={[
                        styles.tab,
                        isActive(tab.name) ? styles.tabActive : styles.tabInactive,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            isActive(tab.name) ? styles.tabTextActive : styles.tabTextInactive,
                            extraTextStyle,
                        ]}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '90%',
        flexDirection: "row",
        marginTop: 10,
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#EFEFEF',
    },
    tab: {
        flex: 1,
        padding: 7,
        borderRadius: 5,
        alignItems: "center",
    },
    tabActive: {
        backgroundColor: "white",
    },
    tabInactive: {
        backgroundColor: "transparent",
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    tabTextActive: {
        color: "black",
    },
    tabTextInactive: {
        color: Colors.textSecondary,
    },
});