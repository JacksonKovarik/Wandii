import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Overview() {
  const { tripId } = useLocalSearchParams();
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Overview for Trip ID: {tripId}</Text>
    </View>
  );
}