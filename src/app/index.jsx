import { Text, View } from "react-native";
import GetStartedButton from "../components/getStartedButton";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome Screen</Text>
      <GetStartedButton></GetStartedButton>
    </View>
  );
}
