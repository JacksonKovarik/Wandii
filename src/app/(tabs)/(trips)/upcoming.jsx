import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Upcoming() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Upcoming Trips Screen</Text>
      <Link href={`/(trip-info)/${1}/overview`} style={{ color: "blue" }}>View Trip Navigation</Link>
    </View>
  );
}