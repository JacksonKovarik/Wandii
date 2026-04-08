import PastTripCard from "@/src/components/pastTripCard";
import { Colors } from "@/src/constants/colors";
import { usePastTrips } from "@/src/hooks/usePastTrips";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

export default function Past() {
  const { trips, loading, reloadTrips } = usePastTrips();
  const listRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      reloadTrips();
      if (listRef.current) {
        listRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }, [reloadTrips])
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={trips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PastTripCard trip={item} onRelivePress={() => {}} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <Text style={styles.emptyTrips}>No past trips yet</Text>
            )}
          </View>
        )}
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },
  emptyContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTrips: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
