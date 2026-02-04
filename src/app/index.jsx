import { View, Text, Image, StyleSheet } from "react-native";
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
      <Image source={require("../../assets/images/placeholderWelcome.png")} style={styles.image}/>
      <Text>Welcome Screen</Text>
      <GetStartedButton></GetStartedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  image:
    {
      width: 300,
      height: 200,
      margin: 20
    }
});
