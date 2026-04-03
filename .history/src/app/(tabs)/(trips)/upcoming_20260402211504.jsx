import UpcomingTripCard from "@/src/components/upcomingTripCard";
import { fakeUpcomingTrips } from "@/src/data/fakeUpcomingTrips";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function Upcoming() {
  const router = useRouter();
  const scrollRef = useRef(null);

  const [trips, setTrips] = useState([]);

  useEffect(() => {
    setTrips(fakeUpcomingTrips);
  }, []);

  const handleOpenTrip = (tripId) => {
    router.push(`/(trip-info)/${tripId}/overview`);
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>

      {trips.length > 0 ? (
        trips.map((trip) => (
          <UpcomingTripCard
            key={trip.id}
            trip={trip}
            onPress={() => handleOpenTrip(trip.id)}
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Plan a New Adventure</Text>

          <Link href={"/(add-trips)/tripPlanFirst"} push asChild>
            <TouchableOpacity
              style={{
                height: 50,
                width: 50,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#E5E7EB",
                borderRadius: 25,
              }}
            >
              <MaterialIcons name="add" size={30} color="#6B7280" />
            </TouchableOpacity>
          </Link>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  emptyBox: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#9d9d9d",
    borderStyle: "dashed",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  emptyText: {
    fontSize: moderateScale(18),
    color: "#9d9d9d",
    marginBottom: 20,
  },
});