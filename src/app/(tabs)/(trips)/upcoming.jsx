import { GroupDisplay } from "@/src/components/GroupDisplay";
import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

const MOCK_TRIP_DATA = [
  {
    id: 'trip-123',
    name: 'Japan 2026', // Added Trip Name for the header!
    takeoffDays: 12,
    destination: 'Kyoto, Japan',
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
    destination: 'Miami, Florida',
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
    destination: 'Paris & Rome',
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

const UpcomingTripCard = ({ trip }) => {
  const router = useRouter(); // <-- Initialize the router

  // Come up with functionality for this
  const tripStatus = 'Finalizing Itinerary'
  return (
    <TouchableOpacity 
      style={styles.card}
      // Add the onPress event here!
      onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)} 
    >
      <Image source={trip.image} contentFit='cover' cachePolicy='memory-disk' style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{trip.destination}</Text>
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
      </View>
    </TouchableOpacity>
  )
};

export default function Upcoming() {
  return (
    <ScrollView contentContainerStyle={styles.container}>

      { MOCK_TRIP_DATA.map(trip => <UpcomingTripCard key={trip.id} trip={trip} />)}


      {/* <Link href={"/(add-trips)/tripPlanFirst"} push asChild>
        <TouchableOpacity style={styles.emptyBox} >
          <Text style={styles.emptyText}>Plan a New Adventure</Text>
          <MaterialIcons name="add" size={moderateScale(30)} color={Colors.textSecondary} />
        </TouchableOpacity>
      </Link> */}

      {/* <Link href="/(trip-info)/1/overview">Go To Trip Info</Link> */}

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
});
