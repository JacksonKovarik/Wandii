import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import ReusableTabBar from "@/src/components/reusableTabBar";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { supabase } from '@/src/lib/supabase';
import DateUtils from "@/src/utils/DateUtils";
import { openAddressInMaps } from "@/src/utils/LinkingUtils";
import { getCoordinatesForAddress } from "@/src/utils/LocationUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
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

export default function Stays() {
  const tripData = useTrip();
  const { tripId, destination } = tripData;

  // --- LOCAL DATA STATE ---
  const [staysData, setStaysData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FORM STATE ---
  const defaultStayState = { id: null, title: '', address: '', checkIn: null, checkOut: null };
  const [isModalVisible, setModalVisible] = useState(false);
  const [stayForm, setStayForm] = useState(defaultStayState);
  
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState(null);

  // --- DATABASE ACTIONS ---

  // 1. Fetch Stays
  const fetchStays = async () => {
    if (!tripId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Accommodations')
        .select('*')
        .eq('trip_id', tripId)
        .order('check_in', { ascending: true }); // Chronological order!

      if (error) throw error;
      setStaysData(data || []);
    } catch (err) {
      console.error("Error fetching stays:", err);
      Alert.alert("Error", "Could not load accommodations.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchStays();
  }, [tripId]);

  // 2. Delete Stay
  const handleDeletePress = (stayId) => {
    Alert.alert(
      "Delete Stay",
      "Are you sure you want to remove this accommodation?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              const { error } = await supabase
                .from('Accommodations')
                .delete()
                .eq('accommodation_id', stayId);
              
              if (error) throw error;
              fetchStays(); // Refresh list after delete
            } catch (err) {
              console.error("Delete Error:", err);
              Alert.alert("Error", "Could not delete stay.");
            }
        }}
      ]
    );
  };

  const handleOpenAdd = () => {
    setStayForm(defaultStayState);
    setModalVisible(true);
  };

  const handleOpenEdit = (stay) => {
    setStayForm({
      id: stay.accommodation_id, // Map DB ID
      title: stay.title,
      address: stay.address,
      checkIn: stay.check_in ? new Date(stay.check_in) : null, // Map DB snake_case to UI camelCase
      checkOut: stay.check_out ? new Date(stay.check_out) : null,
    });
    setModalVisible(true);
  };

  // 3. Save / Update Stay
  const handleSaveStay = async () => {
    try {
      let coords;
      if (stayForm.address) {
        coords = await getCoordinatesForAddress(stayForm.address, destination);      
      }

      const dbPayload = {
        trip_id: tripId,
        title: stayForm.title,
        address: stayForm.address,
        check_in: stayForm.checkIn ? stayForm.checkIn.toISOString() : null,
        check_out: stayForm.checkOut ? stayForm.checkOut.toISOString() : null,
        latitude: coords?.latitude || null,  // Use optional chaining
        longitude: coords?.longitude || null,      };

      if (stayForm.id) {
        // UPDATE
        const { error } = await supabase
          .from('Accommodations')
          .update(dbPayload)
          .eq('accommodation_id', stayForm.id);
        
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from('Accommodations')
          .insert(dbPayload);
          
        if (error) throw error;
      }
      
      setModalVisible(false);
      setStayForm(defaultStayState);
      fetchStays(); // Refresh UI

    } catch (err) {
      console.error("Save Error:", err);
      Alert.alert("Error", "Could not save accommodation details.");
    }
  };

  // --- DATE PICKER LOGIC ---
  const showDatePicker = (target) => {
    setDatePickerTarget(target);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setDatePickerTarget(null);
  };

  const handleConfirmDate = (date) => {
    setStayForm(prev => ({ ...prev, [datePickerTarget]: date }));
    hideDatePicker();
  };

  return (
    // Replaced generic refreshTripData with our explicit fetchStays function
    <TripInfoScrollView style={styles.container} onRefresh={fetchStays}>
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

      <View style={styles.scrollContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
          <Text style={styles.sectionTitle}>Accommodations</Text>
          <TouchableOpacity style={{ flexDirection: 'row', gap: 5 }} onPress={handleOpenAdd}>
            <MaterialIcons name="add" size={moderateScale(18)} color={Colors.primary} />
            <Text style={styles.newEntryButton}>Add Stay</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : staysData.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.gray, marginTop: 20 }}>No accommodations booked yet.</Text>
        ) : (
          staysData.map(stay => (
            <StayCard 
               key={stay.accommodation_id} 
               stay={stay} 
               onEdit={handleOpenEdit} 
               onDelete={handleDeletePress} 
            />
          ))
        )}
      </View>

      <AnimatedBottomSheet visible={isModalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
             {stayForm.id ? 'Edit Accommodation' : 'Add Accommodation'}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <MaterialIcons name="close" size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <TextInput 
            style={styles.premiumTitleInput} 
            placeholder="Name of Hotel, Airbnb..." 
            placeholderTextColor="#94a3b8"
            value={stayForm.title}
            onChangeText={(text) => setStayForm({...stayForm, title: text})}
          />

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>ADDRESS</Text>
            <TextInput 
              style={styles.standardInput} 
              placeholder="123 Main St, City, Country" 
              placeholderTextColor="#94a3b8"
              value={stayForm.address}
              onChangeText={(text) => setStayForm({...stayForm, address: text})}
            />
          </View>

          <View style={styles.rowSection}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.sectionLabel}>CHECK IN</Text>
              <TouchableOpacity style={styles.dateSelector} onPress={() => showDatePicker('checkIn')}>
                <MaterialIcons name="calendar-today" size={16} color={stayForm.checkIn ? Colors.darkBlue : '#94a3b8'} />
                <Text style={stayForm.checkIn ? styles.dateSelectorText : styles.dateSelectorPlaceholder}>
                  {stayForm.checkIn 
                    ? stayForm.checkIn.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) 
                    : 'Select date & time'
                  }
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.sectionLabel}>CHECK OUT</Text>
              <TouchableOpacity style={styles.dateSelector} onPress={() => showDatePicker('checkOut')}>
                <MaterialIcons name="calendar-today" size={16} color={stayForm.checkOut ? Colors.darkBlue : '#94a3b8'} />
                <Text style={stayForm.checkOut ? styles.dateSelectorText : styles.dateSelectorPlaceholder}>
                  {stayForm.checkOut 
                    ? stayForm.checkOut.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) 
                    : 'Select date & time'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.premiumSubmitButton, (!stayForm.title || !stayForm.address) && styles.premiumSubmitDisabled]} 
            disabled={!stayForm.title || !stayForm.address}
            onPress={handleSaveStay}
          >
            <Text style={styles.premiumSubmitText}>
              {stayForm.id ? 'Update Stay' : 'Save Stay'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={stayForm[datePickerTarget] || new Date()}
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          themeVariant="dark" 
        />
      </AnimatedBottomSheet>
    </TripInfoScrollView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: '5%' },
  
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '700', color: Colors.darkBlue },
  newEntryButton: { fontSize: moderateScale(14), color: Colors.primary, fontWeight: '600' },
  
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

  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  closeButton: { backgroundColor: '#f1f5f9', padding: 6, borderRadius: 16 },
  
  premiumTitleInput: { fontSize: 26, fontWeight: '700', color: '#0f172a', marginBottom: 24 },
  inputSection: { marginBottom: 20 },
  rowSection: { flexDirection: 'row', marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 8 },
  
  standardInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', borderWidth: 1, borderColor: '#f1f5f9' },
  
  dateSelector: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  dateSelectorPlaceholder: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  dateSelectorText: { color: '#0f172a', fontSize: 14, fontWeight: '600' },

  premiumSubmitButton: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  premiumSubmitDisabled: { backgroundColor: '#cbd5e1' },
  premiumSubmitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});