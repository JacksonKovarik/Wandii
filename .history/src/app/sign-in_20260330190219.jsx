import { supabase } from "@/src/lib/supabase";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSignIn() {
    try {
      setBusy(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (
          error.code === "invalid_credentials" ||
          error.message.toLowerCase().includes("invalid") ||
          error.message.toLowerCase().includes("credentials") ||
          error.message.toLowerCase().includes("password")
        ) {
          Alert.alert(
            "Wrong credentials",
            "The email or password is incorrect. Would you like to create an account?"
          );
          return;
        }

        throw error;
      }

      router.replace("/(tabs)/home");
    } catch (e) {
      Alert.alert("Sign in failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

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

      <TouchableOpacity
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={onSignIn}
        disabled={busy}
      >
        <Text style={styles.buttonText}>{busy ? "Signing in..." : "Sign In"}</Text>
      </TouchableOpacity>

      <Link href="/sign-up" asChild>
        <TouchableOpacity>
          <Text style={styles.link}>Need an account? Create one</Text>
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