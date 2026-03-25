import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Overview() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const tripId = useMemo(() => {
    const raw = params.tripId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.tripId]);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      if (!user || !tripId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("trips")
        .select("id, title, destination, start_date, end_date, budget_estimate, vibe")
        .eq("id", tripId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.warn(error.message);
        setTrip(null);
      } else {
        setTrip(data);
      }

      setLoading(false);
    }

    loadTrip();
  }, [user?.id, tripId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF8820" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Trip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.tripTitle}>{trip.title}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Destination</Text>
        <Text style={styles.value}>{trip.destination || "No destination yet"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Dates</Text>
        <Text style={styles.value}>
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Vibe</Text>
        <Text style={styles.value}>{trip.vibe || "Relaxing"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Budget</Text>
        <Text style={styles.value}>
          {trip.budget_estimate != null ? `$${Math.round(Number(trip.budget_estimate))}` : "$0"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  tripTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#F5F6F8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A8A8A",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
});