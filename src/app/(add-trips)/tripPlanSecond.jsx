import { Link } from "expo-router";
import { Text, View } from "react-native";


export default function TripPlanSecond() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Second Trip Plan Screen</Text>
      <Link href="tripPlanThird" style={{ marginTop: 20, color: 'blue' }}>
        Go to Third Trip Plan
      </Link>
    </View>
  );
}