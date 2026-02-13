import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
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
        marginTop: moderateScale(10),
        padding: moderateScale(5),
        borderRadius: moderateScale(5),
        backgroundColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        paddingHorizontal: moderateScale(4),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(5),
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
        fontSize: moderateScale(16),
    },
    tabTextActive: {
        color: "black",
    },
    tabTextInactive: {
        color: Colors.textSecondary,
    },
});