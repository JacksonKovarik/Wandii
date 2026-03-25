import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function GetStartedButton() {
  const router = useRouter();
  const { user, loading } = useAuth();

  function handlePress() {
    if (loading) return;

    if (user) {
      // correct route for your app
      router.replace("/(tabs)/home");
    } else {
      router.push("/sign-in");
    }
  }

  return (
    <Pressable onPress={handlePress} style={styles.button} disabled={loading}>
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