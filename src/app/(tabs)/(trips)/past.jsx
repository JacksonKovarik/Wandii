import PastTripCard from "@/src/components/pastTripCard";
import { RefreshBar } from "@/src/components/trip-info/refreshBar"; // 1. Import your custom bar
import { Colors } from "@/src/constants/colors";
import { usePastTrips } from "@/src/hooks/usePastTrips";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from 'expo-haptics'; // 2. Import Haptics
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

export default function Past() {
  const { trips, loading, refetch } = usePastTrips();
  const listRef = useRef(null);
  
  const [refreshing, setRefreshing] = useState(false);
  
  // 3. Add the exact same refs from your TripInfoScrollView
  const hapticFired = useRef(false); 
  const isDragging = useRef(false);

  useFocusEffect(
    useCallback(() => {
      refetch(); 
      if (listRef.current && trips.length > 0) {
        listRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }, [refetch, trips.length])
  );

  // 4. Wrap refetch in your custom loader logic
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // 5. Port over the custom scroll tracking functions
  const handleScrollBeginDrag = () => {
    isDragging.current = true;
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Fire haptic when pulled down past -60
    if (isDragging.current && offsetY <= -60 && !refreshing && !hapticFired.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
      hapticFired.current = true; 
    }
    
    // Reset haptic flag if they scroll back up
    if (offsetY > -60 && hapticFired.current) {
      hapticFired.current = false;
    }
  };

  const handleScrollEndDrag = (event) => {
    isDragging.current = false; 
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Trigger refresh if they let go while pulled down past -60
    if (offsetY <= -60 && !refreshing) {
      handleRefresh(); 
    }
    hapticFired.current = false;
  };

  return (
    <View style={styles.container}>
      {/* 6. Place your custom RefreshBar at the very top of the screen */}
      <RefreshBar isRefreshing={refreshing} />
      
      <FlatList
        ref={listRef}
        data={trips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PastTripCard trip={item} onRelivePress={() => {}} />}
        
        // 7. Attach the scroll listeners
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16} // CRITICAL: Ensures onScroll fires smoothly to catch the -60 threshold

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
