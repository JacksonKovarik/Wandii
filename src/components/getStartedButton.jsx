import { useRouter } from 'expo-router';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from "../constants/colors"
import { getIsLoggedIn } from "../lib/auth";

export default function GetStartedButton() {
  const router = useRouter();

  async function handlePress() {
    const loggedIn = await getIsLoggedIn();
    if (loggedIn) {
      router.replace({pathname: "/home"}); // go to main app and prevent back to welcome
    } else {
      router.push({pathname: "/sign-in"});
    }
  }

  return (
    <Pressable
        onPress = {handlePress}
        style = {styles.button}
    >
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
    borderRadius: 20
  },
  text: {
    fontSize: 20
  },
});