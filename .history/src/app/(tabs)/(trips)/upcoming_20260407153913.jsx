import { UpcomingTripCard } from "@/src/components/upcomingTripCard";
import { Colors } from "@/src/constants/colors";
import { useUpcomingTrips } from "@/src/hooks/useUpcomingTrips";
import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function Upcoming() {
  const { trips, loading, user, handleDeleteTrip, handleLeaveTrip } =
    useUpcomingTrips();

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {trips && trips.length > 0 ? (
        <>
          {/* FIRST UPCOMING TRIP */}
          <UpcomingTripCard
            key={trips[0].id}
            trip={trips[0]}
            onDelete={
              trips[0].creator_id === user?.id
                ? handleDeleteTrip
                : handleLeaveTrip
            }
            isCreator={trips[0].creator_id === user?.id}
          />

          {/* ORIGINAL LINK RESTORED */}
          <Link
            href={`/(trip-info)/${trips[0].id}/overview`}
            push
            style={{
              marginTop: 10,
              marginBottom: 20,
              color: "#6193FF",
              fontWeight: "700",
              fontSize: moderateScale(16),
              alignSelf: "flex-start",
            }}
          >
            View Trip Details
          </Link>

          {/* REMAINING UPCOMING TRIPS */}
          {trips.slice(1).map((trip) => {
            const isCreator = trip.creator_id === user?.id;
            return (
              <UpcomingTripCard
                key={trip.id}
                trip={trip}
                onDelete={isCreator ? handleDeleteTrip : handleLeaveTrip}
                isCreator={isCreator}
              />
            );
          })}
        </>
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