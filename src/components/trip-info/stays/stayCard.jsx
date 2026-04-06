import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { moderateScale } from "react-native-size-matters";

const copyToClipboard = async ({ textToCopy }) => {
  await Clipboard.setStringAsync(textToCopy);
  alert('Text copied to clipboard!');
};

const StayCard = ({ stay, onEdit, onDelete }) => {
  return (
    <View style={styles.cardShadow}>
      <View style={styles.cardContainer}>
        {/* <ImageBackground source={{ uri: stay.image }} style={styles.cardImage} /> */}

        <LinearGradient
          // A beautiful, subtle modern blue/slate gradient
          colors={['#0f172a', '#3b82f6']} 
          // colors={['#FF512F', '#F09819']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardImage, { justifyContent: 'center', alignItems: 'center' }]}
        >
           <MaterialIcons name="hotel" size={moderateScale(50)} color="#ffffff" style={{ opacity: 0.25 }} />
        </LinearGradient>

        <View style={styles.cardContent}>
          {/* Mapped to stay.title from DB */}
          <Text style={styles.stayName}>{stay.title}</Text>
        
          <View style={styles.addressRow}>
            <MaterialIcons name="location-pin" size={moderateScale(20)} color={Colors.primary} />
            <Text style={styles.addressText}>{stay.address}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => copyToClipboard({ textToCopy: stay.address })} hitSlop={5}>
              <MaterialIcons name="content-copy" size={moderateScale(16)} color={Colors.gray} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 15 }}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.dateLabel}>CHECK IN</Text>
              {/* Mapped to stay.check_in from DB */}
              <Text style={styles.dateValue}>{stay.check_in ? DateUtils.formatDayAndTime(DateUtils.timestampToDate(stay.check_in)) : 'TBD'}</Text>
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.dateLabel}>CHECK OUT</Text>
              {/* Mapped to stay.check_out from DB */}
              <Text style={styles.dateValue}>{stay.check_out ? DateUtils.formatDayAndTime(DateUtils.timestampToDate(stay.check_out)) : 'TBD'}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={() => { openAddressInMaps(stay.address);}}
            hitSlop={5}
          >
            <MaterialIcons name="near-me" size={moderateScale(16)} color="#ffffff" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        <View style={{ position: 'absolute', top: 12, right: 10 }}>
          <Menu>
            <MenuTrigger customStyles={{ triggerPadding: 0 }}>
              <BlurView intensity={50} tint="default" style={styles.menuTriggerBlur}>
                <MaterialIcons name="more-vert" size={moderateScale(20)} color={'white'} />
              </BlurView>
            </MenuTrigger>

            <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
              <MenuOption onSelect={() => onEdit(stay)} customStyles={{ optionWrapper: { padding: 10 } }}>
                <Text style={{ fontSize: moderateScale(14), color: Colors.darkBlue }}>Edit</Text>
              </MenuOption>
              <View style={{ height: 1, backgroundColor: Colors.lightGray, marginHorizontal: 5 }} />
              {/* Pass accommodation_id to delete */}
              <MenuOption onSelect={() => onDelete(stay.accommodation_id)} customStyles={{ optionWrapper: { padding: 10 } }}>
                <Text style={{ fontSize: moderateScale(14), color: 'red' }}>Delete</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </View>
  ); 
};

const styles = StyleSheet.create({
      cardShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: 25 },
  cardContainer: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', width: '100%' },
  cardImage: { height: 140 },
  cardContent: { paddingVertical: 20, paddingHorizontal: 15 },
  stayName: { fontSize: moderateScale(16), fontWeight: '600', color: Colors.darkBlue, marginBottom: 5 },
  
  addressRow: { width: '100%', flexDirection: 'row', gap: 5, marginBottom: 10, backgroundColor: Colors.lightGray, padding: 10, borderRadius: 4, alignSelf: 'flex-start', alignItems: 'center', marginTop: 10 },
  addressText: { flex: 1, fontSize: moderateScale(11), color: Colors.gray, fontWeight: '500' },
  divider: { height: 2, backgroundColor: Colors.lightGray, width: '100%', marginTop: 10 },
  dateLabel: { fontSize: moderateScale(10), color: Colors.gray, fontWeight: '700' },
  dateValue: { fontSize: moderateScale(14), color: Colors.darkBlue, fontWeight: '700' },
  
  directionsButton: { width: '100%', flexDirection: 'row', paddingVertical: 10, backgroundColor: Colors.darkBlue, alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 10, alignSelf: 'center', marginTop: 20},
  directionsButtonText: { fontSize: moderateScale(14), color: '#ffffff', fontWeight: '600' },
  menuTriggerBlur: { padding: 5, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 25, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  menuOptionsContainer: { borderRadius: 10, padding: 5, width: 120, marginTop: 40 },
});


export default StayCard;