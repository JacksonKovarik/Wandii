import { Text, View } from "react-native";
import PlanNewTripCard from "@/src/components/planNewTripCard";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        //justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PlanNewTripCard></PlanNewTripCard>
    </View>
  );
}
