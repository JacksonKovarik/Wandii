import { useRouter } from 'expo-router';
import { Button } from 'react-native';
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
    <Button
        onPress={handlePress}
        title = "Get Started"
        color = "#FF8820"
    />
  );
}
