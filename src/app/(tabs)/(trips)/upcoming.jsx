import AddTripButton from "@/src/components/addTripButton";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Upcoming() {
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
      .select("id, title, destination, start_date, end_date, cover_photo_url")
      .eq("user_id", user.id)
      .gte("end_date", today)
      .order("start_date", { ascending: true });

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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (!trips.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Plan a New Adventure</Text>
          <AddTripButton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: verticalScale(30) }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <AddTripButton />
          </View>
        }
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20, backgroundColor: "white" },

  emptyBox: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#9d9d9d",
    borderStyle: "dashed",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: { fontSize: moderateScale(18), color: "#9d9d9d", marginBottom: 20 },

  tripRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  tripTitle: { fontSize: 18, fontWeight: "700" },
  tripSub: { marginTop: 4, color: "#666" },
  tripDates: { marginTop: 6, color: "#999", fontSize: 13 },
});