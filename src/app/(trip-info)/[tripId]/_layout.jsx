import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from "react-native";

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function HeaderBody({ trip }) {
  return (
    <>
      <LinearGradient
        style={styles.gradient}
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,.2)", "rgba(0,0,0,.6)", "rgba(0,0,0,0.8)"]}
        locations={[0, 0.49, 0.78, 1]}
      />

      <View style={styles.contentWrapper}>
        <View style={styles.spacer} />
        <View style={styles.textContainer}>
          <Text style={styles.destination}>{trip.destination}</Text>
          <Text style={styles.dateRange}>
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </Text>
        </View>
      </View>
    </>
  );
}

export default function TripInfoLayout() {
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
        .select("id, title, destination, start_date, end_date, cover_photo_url")
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
        <Text style={styles.notFoundTitle}>Trip not found</Text>
        <Text style={styles.notFoundSub}>This trip does not belong to the signed-in user.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        {trip.cover_photo_url ? (
          <ImageBackground
            source={{ uri: trip.cover_photo_url }}
            style={styles.imageBackground}
            resizeMode="cover"
          >
            <HeaderBody trip={trip} />
          </ImageBackground>
        ) : (
          <View style={[styles.imageBackground, styles.fallbackBackground]}>
            <HeaderBody trip={trip} />
          </View>
        )}

        <TripInfoTabBar tripId={trip.id} />
      </View>

      <Tabs
        screenOptions={{
          tabBarStyle: { display: "none" },
          headerShown: false,
        }}
      >
        <Tabs.Screen name="overview" options={{ title: "Overview" }} />
        <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
        <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
        <Tabs.Screen name="docs" options={{ title: "Docs" }} />
        <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: "39%",
  },
  imageBackground: {
    flex: 1,
  },
  fallbackBackground: {
    backgroundColor: "#3B4A60",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: "20%",
    paddingBottom: "8%",
  },
  spacer: {
    flex: 1,
  },
  textContainer: {
    gap: 4,
  },
  destination: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  dateRange: {
    color: "white",
    fontSize: 16,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  notFoundSub: {
    color: "#666",
    textAlign: "center",
  },
});