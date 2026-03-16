import PastTripCard from "@/src/components/pastTripCard";
import ReliveStoryViewer from "@/src/components/ReliveStoryViewer"; // <-- Import the viewer we discussed
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import JapanImage from '@/assets/images/japan.png';
import ParisImage from '@/assets/images/paris.png';

export default function Past() {
  // 1. Add state to track which trip's story is currently open
  const [activeStoryTrip, setActiveStoryTrip] = useState(null);

  // 2. Expanded Mock Data (Now includes memories for the Story Viewer)
  const trips = [
    {
      id: "trip-jp",
      name: "Japan 2026",
      location: "Kyoto, Japan",
      dates: "Oct 12 - Oct 24, 2026",
      photos: 142,
      journals: 5,
      image: JapanImage,
      memories: [
        {
          id: 1,
          title: 'Arrived in Kyoto!',
          description: 'The flight was long but we finally made it. Checked into the Ryokan and immediately found ramen.',
          date: 'Oct 12, 2026',
          images: [JapanImage], // Using the main image as a placeholder for the slide
        },
        {
          id: 2,
          title: 'Bamboo Forest',
          description: 'Visited Arashiyama. The scenery was breathtaking and the weather was perfect.',
          date: 'Oct 13, 2026',
          images: [JapanImage], 
        },
      ]
    },
    {
      id: "trip-fr",
      name: "Paris 2025",
      location: "Paris, France",
      dates: "Dec 4 - Dec 20, 2023",
      photos: 89,
      journals: 12,
      image: ParisImage,
      memories: [
        {
          id: 3,
          title: 'Eiffel Tower Sparkle',
          description: 'Caught the light show right at 9 PM. Freezing but worth it.',
          date: 'Dec 5, 2023',
          images: [ParisImage],
        },
        {
          id: 4,
          title: 'Louvre Day',
          description: 'Spent 6 hours here and still barely saw 10% of it!',
          date: 'Dec 7, 2023',
          images: [ParisImage],
        }
      ]
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        // 3. Pass a callback to your card so it knows when "Relive Trip" is pressed
        renderItem={({ item }) => (
          <PastTripCard 
            trip={item} 
            onRelivePress={() => setActiveStoryTrip(item)} 
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTrips}>No Trips Found...</Text>
          </View>
        )}
        contentContainerStyle={
          trips.length === 0 ? styles.emptyContainer : styles.listContainer
        }
      />

      {/* 4. The Full-Screen Modal for the Story Viewer */}
      <Modal
        visible={activeStoryTrip !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveStoryTrip(null)} // Handles Android back button
      >
        {activeStoryTrip && (
          <ReliveStoryViewer 
            trip={activeStoryTrip} 
            onClose={() => setActiveStoryTrip(null)} 
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { paddingTop: verticalScale(20), paddingHorizontal: scale(20) },
  emptyContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  emptyContent: { justifyContent: "center", alignItems: "center" },
  emptyTrips: { fontSize: moderateScale(30), opacity: 0.4, color: "#9D9D9D" },
});