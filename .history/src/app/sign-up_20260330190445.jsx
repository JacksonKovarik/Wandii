import { supabase } from "@/src/lib/supabase";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSignUp() {
    try {
      if (password !== confirm) {
        Alert.alert("Passwords do not match");
        return;
      }

      setBusy(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign up failed", error.message);
        return;
      }

      Alert.alert(
        "Account created",
        "Please check your email to confirm your account before signing in."
      );

      router.replace("/sign-in");
    } catch (e) {
      Alert.alert("Sign up failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
      />

      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Re-enter Password"
      />

      <TouchableOpacity
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={onSignUp}
        disabled={busy}
      >
        <Text style={styles.buttonText}>{busy ? "Creating..." : "Create Account"}</Text>
      </TouchableOpacity>

      <Link href="/sign-in" asChild>
        <TouchableOpacity>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "white" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  input: { backgroundColor: "#F3F4F6", padding: 14, borderRadius: 10, marginBottom: 12 },
  button: { backgroundColor: "black", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 6 },
  buttonText: { color: "white", fontWeight: "700" },
  link: { marginTop: 16, color: "#FF8820", fontWeight: "600" },
});
