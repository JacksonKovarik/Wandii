import ReusableTabBar from "@/src/components/reusableTabBar";
import { Colors } from "@/src/constants/colors";
import { openAddressInMaps } from "@/src/utils/LinkingUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from 'expo-clipboard';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function Stays() {
  const tripData = useTrip();
  const { staysData = []} = tripData
  
  const copyToClipboard = async ({ textToCopy }) => {
    await Clipboard.setStringAsync(textToCopy);
    alert('Text copied to clipboard!');
  };

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
                { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripData.id}/(plan)/idea-board` },
                { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripData.id}/(plan)/timeline` },
                { label: "Map", name: "map", route: `/(trip-info)/${tripData.id}/(plan)/map` },
                { label: "Stays", name: "stays", route: `/(trip-info)/${tripData.id}/(plan)/stays` },
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