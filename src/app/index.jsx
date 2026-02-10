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
      <Image source={require("../../assets/images/Logo.png")} style={styles.image}/>
      <Text style={styles.text}>Wandii</Text>
      <GetStartedButton></GetStartedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  image:
    {
      margin: 20
    },

  text:
    {
      fontSize: 30
    }
});
