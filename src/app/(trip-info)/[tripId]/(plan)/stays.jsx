import ReusableTabBar from "@/src/components/reusableTabBar";
import { Colors } from "@/src/constants/colors";
import { openAddressInMaps } from "@/src/utils/LinkingUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from "expo-router";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function Stays() {
  const tripId = useLocalSearchParams();
  
  const copyToClipboard = async ({ textToCopy }) => {
    await Clipboard.setStringAsync(textToCopy);
    alert('Text copied to clipboard!');
  };

  const staysData = [
    {
      id: '1',
      name: 'Ryokan Yamazaki',
      address: '11-1 Hirano Miyamotocho, Kita Ward, Kyoto',
      checkIn: '10/20 2:00 PM',
      checkOut: '10/24 12:00 PM',
    },
    {
      id: '2',
      name: 'Park Hyatt Tokyo',
      address: '3-7-1-2 Nishi-Shinjuku, Shinjuku-Ku, Tokyo',
      checkIn: '10/24 3:00 PM',
      checkOut: '10/28 11:00 AM',
    },
    {
      id: '3',
      name: 'Capsule Hotel Anshin Oyado',
      address: '4-2-10 Shinjuku, Shinjuku-ku, Tokyo',
      checkIn: '10/28 4:00 PM',
      checkOut: '10/29 10:00 AM',
    },
  ];

  const StayCard = ({ stay }) => {
    return (
      <View style={styles.cardShadow}>
        <View style={styles.cardContainer}>

          {/* Stay Image */}
          <ImageBackground source={ require("@/assets/images/Kyoto.jpg") } style={styles.cardImage} />

          {/* Stay Information */}
          <View style={styles.cardContent}>
            <Text style={styles.stayName}>{stay.name}</Text>
          
          {/* Address */}
          <View style={{ width: '100%', flexDirection: 'row', gap: 5, marginBottom: 10, backgroundColor: Colors.lightGray, padding: 10, borderRadius: 4, alignSelf: 'flex-start', alignItems: 'center', marginTop: 10 }}>
            <MaterialIcons name="location-pin" size={moderateScale(20)} color={Colors.primary} />
            <Text style={{ flex: 1, fontSize: moderateScale(11), color: Colors.gray, fontWeight: '500'}}>{stay.address}</Text>
            
            {/* Copy Button */}
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => copyToClipboard({ textToCopy: stay.address })} hitSlop={5}>
              <MaterialIcons name="content-copy" size={moderateScale(16)} color={Colors.gray} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 2, backgroundColor: Colors.lightGray, width: '100%', marginTop: 10 }} />

          {/* Check In/Out */}
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 15 }}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={{ fontSize: moderateScale(10), color: Colors.gray, fontWeight: '700' }}>CHECK IN</Text>
              <Text style={{ fontSize: moderateScale(14), color: Colors.darkBlue, fontWeight: '700' }}>{stay.checkIn}</Text>
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={{ fontSize: moderateScale(10), color: Colors.gray, fontWeight: '700' }}>CHECK OUT</Text>
              <Text style={{ fontSize: moderateScale(14), color: Colors.darkBlue, fontWeight: '700' }}>{stay.checkOut}</Text>
            </View>
          </View>
  
          {/* Directions Button */}
          <TouchableOpacity 
            style={{ width: '100%', flexDirection: 'row', paddingVertical: 10, backgroundColor: Colors.darkBlue, alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 10, alignSelf: 'center', marginTop: 20}}
            onPress={() => { openAddressInMaps(stay.address);}}
            hitSlop={5}
          >
            <MaterialIcons name="near-me" size={moderateScale(16)} color="#ffffff" />
            <Text style={{ fontSize: moderateScale(14), color: '#ffffff', fontWeight: '600' }}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Button top right of card */}
        <BlurView intensity={50} tint="default" style={{ position: 'absolute', top: 12, right: 10, padding: 5, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 25, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <TouchableOpacity onPress={() => console.log('Edit stay')} hitSlop={5}>
            <MaterialIcons name="more-vert" size={moderateScale(20)} color={'white'} />
          </TouchableOpacity>
        </BlurView>  
      </View>
      
      </View>
    ); 
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Tab Bar */}
      <View style={{ padding: 10 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <ReusableTabBar 
            tabs={[
                { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripId}/(plan)/idea-board` },
                { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripId}/(plan)/timeline` },
                { label: "Map", name: "map", route: `/(trip-info)/${tripId}/(plan)/map` },
                { label: "Stays", name: "stays", route: `/(trip-info)/${tripId}/(plan)/stays` },
            ]}
            extraBgStyle={{ backgroundColor: '#E0E0E0'}}
          />
        </View>
      </View>

      {/* Stays */}
      <View style={styles.scrollContent}>

        {/* Title */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
          <Text style={styles.sectionTitle}>Accomodations</Text>
          <TouchableOpacity style={{ flexDirection: 'row', gap: 5 }}onPress={() => console.log('New doc pressed')}>
            <MaterialIcons name="add" size={moderateScale(18)} color={Colors.primary} />
            <Text style={styles.newEntryButton}>Add Stay</Text>
          </TouchableOpacity>
        </View>

        {staysData.map(stay => (
          <StayCard key={stay.id} stay={stay} />
        ))}
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: '5%',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  newEntryButton: {
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 25,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  cardImage: {
    height: 140,
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  stayName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.darkBlue,
    marginBottom: 5,
  },
});