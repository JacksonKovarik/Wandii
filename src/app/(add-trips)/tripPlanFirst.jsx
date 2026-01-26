import { Link } from "expo-router";
import { Text, View } from "react-native";


export default function TripPlanFirst() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>First Trip Plan Screen</Text>
      <Link href="tripPlanSecond" style={{ marginTop: 20, color: 'blue' }}>
        Go to Second Trip Plan
      </Link>
    </View>
  );
}