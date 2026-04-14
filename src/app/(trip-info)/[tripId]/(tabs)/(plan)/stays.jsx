import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import ReusableTabBar from "@/src/components/reusableTabBar";
import StayCard from "@/src/components/trip-info/stays/stayCard";
import TripInfoScrollView from "@/src/components/trip-info/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { moderateScale } from "react-native-size-matters";
// NEW IMPORT:
import { useStaysData } from "@/src/hooks/useStaysData";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";

// FIX: Bulletproof date formatting to prevent Hermes engine crashes on Android
const formatSelectedDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let hours = d.getHours();
  let minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mins = minutes < 10 ? `0${minutes}` : minutes;
  return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${mins} ${ampm}`;
};

export default function Stays() {
  const tripData = useTripDashboard();
  const { tripId, destination } = tripData;

  // 🔥 One hook does all the heavy lifting!
  const {
    staysData,
    isLoading,
    isSaving,
    isModalVisible, setModalVisible,
    stayForm, setStayForm,
    isDatePickerVisible, datePickerTarget,
    fetchStays,
    handleDeletePress,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveStay,
    showDatePicker,
    hideDatePicker,
    handleConfirmDate
  } = useStaysData(tripId, destination);


  // FIX: Wrapped everything in a root View and placed AnimatedBottomSheet outside the ScrollView
  return (
    <View style={styles.container}>
      <TripInfoScrollView style={{ flex: 1 }} onRefresh={fetchStays}>
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
            <View style={styles.emptyStayCard}>
              <View style={styles.placeholderRow}>
                <View style={styles.placeholderIcon} />
                <View style={styles.placeholderLines}>
                    <View style={[styles.line, { width: '80%' }]} />
                    <View style={[styles.line, { width: '50%' }]} />
                </View>
              </View>
              <Text style={styles.emptyStayTitle}>Where are you staying?</Text>
              <Text style={styles.emptyStaySub}>Add your hotel, Airbnb, or hostel details here to keep everyone in the loop.</Text>
            </View>
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
      </TripInfoScrollView>

      {/* FIX: Moved Bottom Sheet as a sibling to the ScrollView to prevent gesture capture issues */}
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
                    {stayForm.checkIn ? formatSelectedDate(stayForm.checkIn) : 'Select date & time'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, paddingLeft: 8 }}>
                <Text style={styles.sectionLabel}>CHECK OUT</Text>
                <TouchableOpacity style={styles.dateSelector} onPress={() => showDatePicker('checkOut')}>
                  <MaterialIcons name="calendar-today" size={16} color={stayForm.checkOut ? Colors.darkBlue : '#94a3b8'} />
                  <Text style={stayForm.checkOut ? styles.dateSelectorText : styles.dateSelectorPlaceholder}>
                    {stayForm.checkOut ? formatSelectedDate(stayForm.checkOut) : 'Select date & time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.premiumSubmitButton, (!stayForm.title || !stayForm.address || isSaving) && styles.premiumSubmitDisabled]} 
              disabled={!stayForm.title || !stayForm.address || isSaving}
              onPress={handleSaveStay}
            >
              <Text style={styles.premiumSubmitText}>
                {isSaving ? 'Saving...' : (stayForm.id ? 'Update Stay' : 'Save Stay')}
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
    </View>
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
  // --- EMPTY STATE STYLES ---
  emptyStayCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    borderWidth: 1.5,
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: moderateScale(20),
    opacity: 0.6,
  },
  placeholderIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    backgroundColor: '#f1f5f9',
    marginRight: moderateScale(16),
  },
  placeholderLines: {
    flex: 1,
    gap: moderateScale(10),
  },
  line: {
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#f1f5f9',
  },
  emptyStayTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: Colors.darkBlue || '#0f172a',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  emptyStaySub: {
    fontSize: moderateScale(14),
    color: Colors.textSecondaryDark || '#64748b',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});