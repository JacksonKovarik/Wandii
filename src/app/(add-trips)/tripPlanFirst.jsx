import LocationSearchBar from "@/src/components/locationSearchBar";
import NextStepButton from "@/src/components/nextStepButton";
import { Colors } from "@/src/constants/colors";
import { useTripDraft } from "@/src/context/TripDraftContext";
import DateUtils from "@/src/utils/DateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function TripPlanFirst() {
  const { draft, setField } = useTripDraft();
  const router = useRouter();

  // Safely handle initialization. If older drafts had strings, this standardizes them to objects.
  const [destinations, setDestinations] = useState(() => {
    if (!draft.destination) return [];
    const destArray = Array.isArray(draft.destination) ? draft.destination : [draft.destination];
    return destArray.map(d => typeof d === 'string' ? { name: d } : d);
  });

  const [calendarVisible, setCalendarVisible] = useState(false);
  const formattedDates = DateUtils.formatDateRange(draft.startDate, draft.endDate);

  const [tempStart, setTempStart] = useState(draft.startDate);
  const [tempEnd, setTempEnd] = useState(draft.endDate);

  const [errors, setErrors] = useState({
    tripName: false,
    destination: false,
    dates: false,
  });

  const handleSelectLocation = (item) => {
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.address?.state;
    const country = item.address?.country;
    const countryCode = item.address?.country_code?.toUpperCase();

    const displayCountry = (country && country.length > 10 && countryCode) 
      ? countryCode 
      : country;
    const displayName = city && displayCountry ? `${city}, ${displayCountry}` : item.display_name.split(',')[0];
    
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);


    // 2. Create a rich object instead of just a string
    const newDestObj = {
      name: displayName,
      city: city || null,
      country: country || null,
      countryCode: countryCode || null,
      latitude: lat,
      longitude: lon
    };

    // 3. Prevent duplicates by checking the 'name' property
    const isDuplicate = destinations.some(d => d.name === displayName);

    if (!isDuplicate) {
      const newDestinations = [...destinations, newDestObj];
      setDestinations(newDestinations);
      setField("destination", newDestinations); // Your draft now holds all coordinates!
      if (errors.destination) setErrors(prev => ({ ...prev, destination: false }));
    }
  };

  const removeDestination = (destToRemove) => {
    // Filter by the 'name' property of the object
    const newDestinations = destinations.filter(d => d.name !== destToRemove.name);
    setDestinations(newDestinations);
    setField("destination", newDestinations);
  };

  const onDayPress = (day) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(day.dateString);
      setTempEnd(null);
    } else {
      setTempEnd(day.dateString);
    }
  };

  const markedDates = {};
  if (tempStart) markedDates[tempStart] = { startingDay: true, color: "#FF8820", textColor: "white" };
  if (tempStart && tempEnd) {
    let current = new Date(tempStart);
    const last = new Date(tempEnd);
    current.setDate(current.getDate() + 1);
    while (current < last) {
      const dateString = current.toISOString().split("T")[0];
      markedDates[dateString] = { color: "#FFB97A", textColor: "white" };
      current.setDate(current.getDate() + 1);
    }
    markedDates[tempEnd] = { endingDay: true, color: "#FF8820", textColor: "white" };
  }

  return (
    <View style={styles.screen}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Let's Start Planning</Text>
        <Text style={styles.subHeader}>Where is your next adventure taking you?</Text>

        {/* --- TRIP NAME --- */}
        <View style={{ zIndex: 1 }}>
          <Text style={styles.label}>Trip Name</Text>
          <View style={[styles.inputBar, errors.tripName && styles.errorBorder]}>
            <TextInput
              value={draft.tripName}
              onChangeText={(v) => {
                setField("tripName", v);
                if (errors.tripName && v.trim()) setErrors((prev) => ({ ...prev, tripName: false }));
              }}
              placeholder="e.g. Spring Cherry Blossoms"
              placeholderTextColor="#9d9d9d"
              style={styles.inputText}
              maxLength={45}
            />
          </View>
        </View>

        {/* --- DESTINATIONS --- */}
        <View style={{ zIndex: 10, marginBottom: 20 }}>
          <Text style={styles.label}>Destinations</Text>
          
          <LocationSearchBar 
            placeholder="Search for a city..." 
            onSelect={handleSelectLocation}
            hasError={errors.destination && destinations.length === 0}
          />

          {/* HORIZONTAL CHIPS */}
          {destinations.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.chipContainer}
              keyboardShouldPersistTaps="handled"
            >
              {destinations.map((dest, index) => (
                <View key={index} style={styles.chip}>
                  {/* Now we render dest.name instead of dest */}
                  <Text style={styles.chipText}>{dest.name}</Text>
                  <TouchableOpacity onPress={() => removeDestination(dest)} style={styles.chipClose}>
                    <Ionicons name="close-circle" size={18} color={Colors.darkBlue} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* --- DATES --- */}
        <View style={{ zIndex: 1 }}>
          <Text style={styles.label}>Dates</Text>
          <TouchableOpacity
            style={[styles.inputBar, errors.dates && styles.errorBorder]}
            onPress={() => {
              Keyboard.dismiss();
              setCalendarVisible(true);
            }}
          >
            <Text
              style={[
                styles.inputText,
                { color: draft.startDate && draft.endDate ? "black" : "#9d9d9d" },
              ]}
              numberOfLines={1}
            >
              {formattedDates}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NextStepButton
        onPress={() => {
          const newErrors = {
            tripName: !draft.tripName?.trim(),
            destination: destinations.length === 0,
            dates: !(draft.startDate && draft.endDate),
          };

          setErrors(newErrors);

          if (Object.values(newErrors).some(Boolean)) {
            alert("Please fill out all fields on this page.");
            return;
          }

          router.push("/(add-trips)/tripPlanSecond");
        }}
      />

      {/* CALENDAR MODAL (Unchanged) */}
      <Modal transparent animationType="fade" visible={calendarVisible}>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View style={{ maxHeight: "80%" }}>
              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={onDayPress}
                theme={{
                  textDayFontSize: moderateScale(16), monthTextColor: "#9d9d9d",
                  selectedDayBackgroundColor: "#FF8820", selectedDayTextColor: "#ffffff",
                  todayTextColor: "#FF8820", arrowColor: "#9d9d9d",
                }}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setField("startDate", tempStart);
                    setField("endDate", tempEnd);
                    setErrors((prev) => ({ ...prev, dates: false }));
                    setCalendarVisible(false);
                  }}
                >
                  <Text style={[styles.closeText, { color: "#FF8820", fontWeight: "700" }]}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "white", flex: 1, justifyContent: "space-between", paddingTop: 15 },
  header: { marginTop: -15, fontSize: moderateScale(28), fontWeight: "700" },
  subHeader: { fontSize: moderateScale(15), fontWeight: "500", marginBottom: 30, color: "#626262" },
  
  label: { fontSize: moderateScale(15), color: Colors.darkBlue, marginTop: 10, marginBottom: 10, fontWeight: "600" },
  
  inputBar: {
    width: "100%", backgroundColor: "#f3f4f6b7", paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12), justifyContent: "center", paddingHorizontal: moderateScale(16),
    borderWidth: 1, borderColor: "#F3F4F6", marginBottom: 20,
  },
  inputText: { fontSize: moderateScale(15), color: "black" },
  errorBorder: { borderColor: "rgba(255, 0, 0, 0.35)", borderWidth: 2 },

  chipContainer: { flexDirection: 'row', marginTop: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundLight,
    paddingVertical: moderateScale(6), paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(20), marginRight: moderateScale(8),
    borderWidth: 1, borderColor: Colors.lightGray
  },
  chipText: { fontSize: moderateScale(13), color: Colors.darkBlue, fontWeight: '500' },
  chipClose: { marginLeft: moderateScale(6) },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  popup: {
    width: "90%", maxHeight: "70%", backgroundColor: "white", borderRadius: moderateScale(16),
    padding: verticalScale(16), elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10,
  },
  closeText: { textAlign: "center", marginTop: 12, fontSize: moderateScale(16), color: "#FF8820" },
});