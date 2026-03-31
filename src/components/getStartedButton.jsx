import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function GetStartedButton({ onPress }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <Pressable onPress={onPress} style={styles.button} disabled={loading}>
      <Text style={styles.text}>{loading ? "Loading..." : "Get Started"}</Text>
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