import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Past() {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTrips() {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("trips")
      .select("id, title, destination, start_date, end_date")
      .eq("user_id", user.id)
      .lt("end_date", today)
      .order("end_date", { ascending: false });

    if (error) {
      console.warn(error.message);
      setTrips([]);
    } else {
      setTrips(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTrips();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tripRow}
            onPress={() => router.push(`/(trip-info)/${item.id}/overview`)}
          >
            <Text style={styles.tripTitle}>{item.title}</Text>
            <Text style={styles.tripSub}>{item.destination}</Text>
            <Text style={styles.tripDates}>
              {formatDate(item.start_date)} - {formatDate(item.end_date)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTrips}>{loading ? "Loading..." : "No Past Trips Found..."}</Text>
          </View>
        )}
        contentContainerStyle={
          trips.length === 0 ? styles.emptyContainer : styles.listContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  listContainer: {
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTrips: {
    fontSize: moderateScale(24),
    opacity: 0.5,
    color: "#9D9D9D",
    textAlign: "center",
  },

  tripRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  tripTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
  },

  tripSub: {
    marginTop: 4,
    color: "#666",
  },

  tripDates: {
    marginTop: 6,
    color: "#999",
    fontSize: 13,
  },
});