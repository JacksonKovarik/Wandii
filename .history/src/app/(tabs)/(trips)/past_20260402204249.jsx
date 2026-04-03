import PastTripCard from "@/src/components/pastTripCard";
import { tripCards } from "@/src/data/tripCards";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function Past() {
  const trips = tripCards;
  const loading = false;
  const listRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (listRef.current) {
        listRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PastTripCard trip={item} onRelivePress={() => {}} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTrips}>
              {loading ? "Loading..." : "No Trips Found..."}
            </Text>
          </View>
        )}
        contentContainerStyle={
          trips.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  emptyTrips: {
    fontSize: moderateScale(30),
    opacity: 0.4,
    color: "#9D9D9D",
  },
});