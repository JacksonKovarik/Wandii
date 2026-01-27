import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";

export default function TripsTabBar() {
    const route = useRoute();
    const router = useRouter();

    return (
        <View 
            style={{
                display: 'flex',
                width: '90%',
                flexDirection: "row", 
                marginTop: 10, 
                padding: 5, 
                borderRadius:5, 
                backgroundColor: '#EFEFEF'
            }}
        >
            <TouchableOpacity
                onPress={ () => router.navigate("/(tabs)/(trips)/upcoming")}
                style={{
                    flex: 1,
                    padding: 7,
                    backgroundColor: route.name === "upcoming" ? "white" : "transparent",
                    borderRadius: 5,
                    alignItems: "center",
                }}
            >
                <Text style={{ fontSize: 16, color: route.name === "upcoming" ? "black" : Colors.textSecondary }}>Upcoming</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={ () => router.navigate("/(tabs)/(trips)/past")}
                style={{
                    flex: 1,
                    padding: 7,
                    backgroundColor: route.name === "past" ? "white" : "transparent",
                    borderRadius: 5,
                    alignItems: "center",
                }}
            >
                <Text style={{ fontSize: 16, color: route.name === "past" ? "black" : Colors.textSecondary }}>Past</Text>
            </TouchableOpacity>
        </View>
    );
}
