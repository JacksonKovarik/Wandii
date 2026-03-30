import { Colors } from "@/src/constants/colors";
import { Pressable, StyleSheet, Text } from "react-native";

export default function GetStartedButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>Get Started</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    paddingHorizontal: 70,
    margin: 15,
    borderRadius: 20,
    opacity: 1,
  },
  text: {
    fontSize: 20,
  },
});