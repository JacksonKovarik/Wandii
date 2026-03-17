import { GroupDisplay } from "@/src/components/GroupDisplay";
import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { moderateScale, verticalScale } from "react-native-size-matters";

const MOCK_TRIP_DATA = [
  {
    id: 'trip-123',
    name: 'Japan 2026', // Added Trip Name for the header!
    takeoffDays: 12,
    destinations: 'Kyoto, Japan',
    startDate: '2024-10-12',
    endDate: '2024-10-24',
    image: require('../../../../assets/images/Kyoto.jpg'),
    readinessPercent: 60,
    group: [
        { id: 1, name: "Alice B.", initials: "AB", profileColor: '#1E90FF', profilePic: null, active: false },
        { id: 2, name: "Hunter S.", initials: "HS", profileColor: '#32CD32', profilePic: null, active: true },
        { id: 3, name: "Maria K.", initials: "MK", profileColor: '#FFA500', profilePic: null, active: true },
    ],
  },
  {
    id: 'trip-456',
    name: 'Miami Bachelor Party',
    destinations: 'Miami, Florida',
    startDate: '2026-05-08',
    endDate: '2026-05-11',
    image: require('../../../../assets/images/Miami.jpg'), 
    readinessPercent: 90,
    group: [
        { id: 2, name: "Hunter S.", initials: "HS", profileColor: '#32CD32', active: true },
        { id: 4, name: "David L.", initials: "DL", profileColor: '#FF4500', active: true },
        { id: 5, name: "Chris T.", initials: "CT", profileColor: '#8A2BE2', active: false },
    ],
  },
  {
    id: 'trip-789',
    name: 'Euro Trip',
    destinations: 'Paris & Rome',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    image: require('../../../../assets/images/paris.png'), 
    readinessPercent: 20,
    group: [
        { id: 1, name: "Alice B.", initials: "AB", profileColor: '#1E90FF', active: true },
        { id: 3, name: "Maria K.", initials: "MK", profileColor: '#FFA500', active: true },
    ],
  }
];

const UpcomingTripCard = ({ trip, onDelete }) => {
  const router = useRouter(); // <-- Initialize the router

  // Come up with functionality for this
  const tripStatus = 'Finalizing Itinerary'
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)} 
    >
      <Image source={trip.image} contentFit='cover' cachePolicy='memory-disk' style={styles.cardImage} />
      <View style={[styles.subtitleRow, { position: 'absolute', top: 10, right: 10}]}>
          <BlurView intensity={20} tint="default" style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.38)', overflow: 'hidden' }}/>
            
          <MaterialCommunityIcons name="map-marker-outline" size={moderateScale(14)} color={'white'} />
          <Text style={styles.cardSubtitle}>{trip.destinations}</Text>
        </View> 
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{trip.name}</Text>
       
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6), marginTop: 10}}>
          <MaterialCommunityIcons name="calendar-today" size={moderateScale(14)} color={Colors.textSecondary} />
          <Text style={ styles.dateRange }>{ DateUtils.formatRange(DateUtils.parseYYYYMMDDToDate(trip.startDate), DateUtils.parseYYYYMMDDToDate(trip.endDate)) }</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 5}}>
          <Text style={[styles.progressText, { color: Colors.textSecondary }]} >Status</Text>
          <Text style={[styles.progressText, { color: Colors.primary }]} >{tripStatus}</Text>
        </View>
        <ProgressBar width="100%" height={moderateScale(8)} progress={`${isNaN(trip.readinessPercent) ? 0 : `${trip.readinessPercent}%`}`} backgroundColor="#F3F3F3" />
        <View style={styles.divider} />
        <GroupDisplay members={trip.group} />

        <View style={{ position: 'absolute', top: 5, right: 3 }}>
          <Menu>
            <MenuTrigger style={{ padding: 10 }}>
              <MaterialIcons name="more-vert" size={moderateScale(20)} color={'grey'} />
            </MenuTrigger>

            <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
              <MenuOption 
                onSelect={() => onDelete(trip.id)} // Correctly call onDelete with the trip's ID
                customStyles={{ optionWrapper: { padding: 10, flexDirection: 'row', gap: 6, padding: 6, alignItems: 'center' } }}
              >
                <MaterialIcons name="delete-outline" size={20} color={'red'} />
                <Text style={{ fontSize: moderateScale(14), color: 'red', fontWeight: '600'}}>Delete</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </TouchableOpacity>
  )
};

export default function Upcoming() {
  const [trips, setTrips] = useState(MOCK_TRIP_DATA);

  const handleDeleteTrip = (tripId) => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this upcoming trip?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => setTrips(currentTrips => currentTrips.filter(trip => trip.id !== tripId)) 
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      { trips.map(trip => <UpcomingTripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: moderateScale(25),
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(5),
    elevation: 4,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 130,
    // borderRadius: moderateScale(16),
    // overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.43)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 20,
    paddingHorizontal: moderateScale(5),
    paddingVertical: moderateScale(4),
    gap: moderateScale(4),
    marginTop: 3, 
    marginBottom: -2,
  },
  cardSubtitle: {
    fontSize: moderateScale(12),
    color: 'white', 
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },


  dateRange: {
    color: Colors.textSecondaryDark,
    fontSize: moderateScale(12),
  },

  emptyBox: {
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    borderStyle: "dashed",
    borderRadius: moderateScale(16),   
    paddingVertical: verticalScale(30), 
    justifyContent: "center",
    alignItems: "center",
  },

  divider: {
    width: "100%",
    height: .7,
    backgroundColor: '#CFCFCF',
    marginVertical: 20,
  },

  emptyText: {
    fontSize: moderateScale(18),       
    color: Colors.textSecondary,
    marginBottom: 20,
  },

  menuOptionsContainer: { borderRadius: 10, padding: 5, width: 120, marginTop: 20 },
});
