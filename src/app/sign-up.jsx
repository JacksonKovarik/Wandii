import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import GetStartedButton from "../components/getStartedButton";

export default function Index() {
  const router = useRouter();

  // which mode we are in (sign in or sign up)
  const [showLogin, setShowLogin] = useState(true);
  const [mode, setMode] = useState("sign-up");

  // input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // validation errors
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    confirm: false,
  });

  // password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // animations
  // animations
const imageSlide = useRef(new Animated.Value(-40)).current; // Shifts the logo up
const panelSlide = useRef(new Animated.Value(0)).current;   // Puts the panel in its final position
const panelFade = useRef(new Animated.Value(1)).current;    // Makes the panel fully visible (opacity 1)

  // moves the whole screen up when typing
  const screenShift = useRef(new Animated.Value(0)).current;

  // clears all input fields
  function resetFields() {
    setEmail("");
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
    setErrors({ email: false, password: false, confirm: false });
  }

  // keyboard animation
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", (e) => {
      Animated.timing(screenShift, {
        toValue: -e.endCoordinates.height * 0.35,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(screenShift, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // shows the login panel
  const revealLogin = () => {
    // close keyboard before animation
    Keyboard.dismiss();

    setShowLogin(true);

    Animated.timing(imageSlide, {
      toValue: -40,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(panelSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(panelFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // sign in
  async function onSignIn() {
    // close keyboard before submitting
    Keyboard.dismiss();

    try {
      setBusy(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Wrong Credentials", "Email or password is incorrect.");
        return;
      }

      router.replace("/(tabs)/home");
    } catch (e) {
      Alert.alert("Sign In Failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  // sign up
  async function onSignUp() {
    // close keyboard before submitting
    Keyboard.dismiss();

    const emailValid = /\S+@\S+\.\S+/.test(email.trim());

    const newErrors = {
      email: email.trim() === "" || !emailValid,
      password: password === "",
      confirm: confirm === "",
    };

    setErrors(newErrors);

    if (email.trim() === "") {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    if (!emailValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password === "") {
      Alert.alert("Password Required", "Please enter a password.");
      return;
    }

    if (confirm === "") {
      Alert.alert("Confirm Password", "Please confirm your password.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Passwords Do Not Match", "Make sure both passwords match.");
      return;
    }

    try {
      setBusy(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      if (!data.session) {
        Alert.alert(
          "Verify Your Email",
          "We sent you a confirmation link. Please check your inbox."
        );

        resetFields();
        setMode("sign-in");
        return;
      }

      router.replace("/(tabs)/home");
    } catch (e) {
      Alert.alert("Sign Up Failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: screenShift }] },
          ]}
        >
          <Animated.View
            style={{
              alignItems: "center",
              transform: [{ translateY: imageSlide }],
            }}
          >
            <Image
              source={require("../../assets/images/Logo.png")}
              style={styles.image}
            />
            <Text style={styles.title}>Wandii</Text>
          </Animated.View>

          {!showLogin && <GetStartedButton onPress={revealLogin} />}

          {showLogin && (
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.loginPanel,
                {
                  opacity: panelFade,
                  transform: [{ translateY: panelSlide }],
                },
              ]}
            >
              <TextInput
                style={[styles.input, errors.email && styles.errorInput]}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors({ ...errors, email: false });
                }}
              />

              <View
                style={[
                  styles.passwordRow,
                  errors.password && styles.errorInput,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrors({ ...errors, password: false });
                  }}
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {mode === "sign-up" && (
                <View
                  style={[
                    styles.passwordRow,
                    errors.confirm && styles.errorInput,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showConfirm}
                    value={confirm}
                    onChangeText={(t) => {
                      setConfirm(t);
                      setErrors({ ...errors, confirm: false });
                    }}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off" : "eye"}
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.signInButton}
                onPress={mode === "sign-in" ? onSignIn : onSignUp}
                disabled={busy}
              >
                <Text style={styles.signInText}>
                  {busy
                    ? mode === "sign-in"
                      ? "Signing in..."
                      : "Creating account..."
                    : mode === "sign-in"
                    ? "Sign In"
                    : "Create Account"}
                </Text>
              </TouchableOpacity>

              {mode === "sign-in" ? (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    resetFields();
                    setMode("sign-up");
                  }}
                >
                  <Text style={styles.signUpLink}>
                    Don’t have an account? Sign up
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    resetFields();
                    setMode("sign-in");
                  }}
                >
                  <Text style={styles.signUpLink}>
                    Already have an account? Sign in
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// STYLESHEET (EXACTLY WHAT YOU PROVIDED)
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },

  image: { 
    margin: 20
  },

  title: { 
    fontSize: 30,
    fontWeight: "700"
  },

  loginPanel: { 
    width: "100%",
    marginTop: 30
  },

  input: {
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16
  },

  passwordRow: {
    backgroundColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },

  signInButton: {
    backgroundColor: "#FF8820",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6
  },

  signInText: { 
    color: "white",
    fontWeight: "700"
  },

  signUpLink: {
    marginTop: 16,
    color: "black",
    fontWeight: "600",
    textAlign: "center"
  },

  errorInput: {
    borderWidth: 2,
    borderColor: "red",
  },
});
