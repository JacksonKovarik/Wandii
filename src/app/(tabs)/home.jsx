import PlanNewTripCard from "@/src/components/planNewTripCard";
import { View } from "react-native";

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
