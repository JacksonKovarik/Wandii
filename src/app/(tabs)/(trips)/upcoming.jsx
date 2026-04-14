import TripInfoScrollView from "@/src/components/trip-info/tripInfoScrollView";
import { UpcomingTripCard } from "@/src/components/upcomingTripCard";
import { Colors } from "@/src/constants/colors";
import { useUpcomingTrips } from "@/src/hooks/useUpcomingTrips";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function Upcoming() {
  const { trips, loading, user, refetch, handleDeleteTrip, handleLeaveTrip } = useUpcomingTrips();
  const [refreshing, setRefreshing] = useState(false);

  // 1. Silently refetch when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // 2. Handle Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <TripInfoScrollView 
      contentContainerStyle={styles.container}
      onRefresh={onRefresh}
    >
      {trips && trips.length > 0 ? (
        trips.map((trip) => {
          const isCreator = trip.creator_id === user?.id;
          return (
            <UpcomingTripCard
              key={trip.id}
              trip={trip}
              onDelete={isCreator ? handleDeleteTrip : handleLeaveTrip}
              isCreator={isCreator}
            />
          );
        })
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
    </TripInfoScrollView>
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