import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "../constants/colors";

export default function ReusableTabBar({ tabs, extraBgStyles, extraTabStyles, extraTextStyles }) {
    const route = useRoute();
    const router = useRouter();

    const isActive = (tabName) => route.name === tabName;

    return (
        <View style={[styles.container, extraBgStyles]}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.route}
                    onPress={() => router.navigate(tab.route)}
                    style={[
                        styles.tab,
                        extraTabStyles,
                        isActive(tab.name) ? styles.tabActive : styles.tabInactive,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            extraTextStyles,
                            isActive(tab.name) ? styles.tabTextActive : extraTextStyles ? extraTextStyles : styles.tabTextInactive,
                        ]}
                        numberOfLines={1}
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
        flexDirection: "row",
        marginTop: moderateScale(10),
        padding: moderateScale(5),
        borderRadius: moderateScale(10),
        backgroundColor: '#E0E0E0',
        gap: moderateScale(10),
        maxWidth: '90%'
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
        fontSize: moderateScale(14),
    },
    tabTextActive: {
        color: "black",
    },
    tabTextInactive: {
        color: Colors.textSecondary,
    },
});