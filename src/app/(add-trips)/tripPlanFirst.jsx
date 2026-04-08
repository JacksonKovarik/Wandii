import NextStepButton from "@/src/components/nextStepButton";
import { useTripDraft } from "@/src/context/TripDraftContext";
import DateUtils from "@/src/utils/DateUtils";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function TripPlanFirst() {
  const { draft, setField } = useTripDraft();
  const router = useRouter();

  const [calendarVisible, setCalendarVisible] = useState(false);
  const formattedDates = DateUtils.formatDateRange(draft.startDate, draft.endDate);

  const [tempStart, setTempStart] = useState(draft.startDate);
  const [tempEnd, setTempEnd] = useState(draft.endDate);

  const [errors, setErrors] = useState({
    tripName: false,
    destination: false,
    dates: false,
  });

  const onDayPress = (day) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(day.dateString);
      setTempEnd(null);
    } else {
      setTempEnd(day.dateString);
    }
  };

  const markedDates = {};
  if (tempStart) {
    markedDates[tempStart] = { startingDay: true, color: "#FF8820", textColor: "white" };
  }
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.header}>Let's Start Planning</Text>
          <Text style={styles.subHeader}>Where is your next adventure taking you?</Text>

          <Text style={styles.label}>Trip Name</Text>
          <View style={[styles.inputBar, errors.tripName && styles.errorBorder]}>
            <TextInput
              value={draft.tripName}
              onChangeText={(v) => {
                setField("tripName", v);
                if (errors.tripName && v.trim()) {
                  setErrors((prev) => ({ ...prev, tripName: false }));
                }
              }}
              placeholder="e.g. Spring Cherry Blossoms"
              placeholderTextColor="#9d9d9d"
              style={styles.inputText}
              maxLength={45}
            />
          </View>

          <Text style={styles.label}>Destination</Text>
          <View style={[styles.inputBar, errors.destination && styles.errorBorder]}>
            <TextInput
              value={draft.destination}
              onChangeText={(v) => {
                setField("destination", v);
                if (errors.destination && v.trim()) {
                  setErrors((prev) => ({ ...prev, destination: false }));
                }
              }}
              placeholder="e.g. Kyoto, Japan"
              placeholderTextColor="#9d9d9d"
              style={styles.inputText}
              maxLength={40}
            />
          </View>

          <Text style={styles.label}>Dates</Text>
          <TouchableOpacity
            style={[styles.inputBar, errors.dates && styles.errorBorder]}
            onPress={() => setCalendarVisible(true)}
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
      </TouchableWithoutFeedback>

      <NextStepButton
        onPress={() => {
          const newErrors = {
            tripName: !draft.tripName?.trim(),
            destination: !draft.destination?.trim(),
            dates: !(draft.startDate && draft.endDate),
          };

          setErrors(newErrors);

          const hasError = Object.values(newErrors).some(Boolean);
          if (hasError) {
            alert("Please fill out all fields on this page.");
            return;
          }

          router.push("/(add-trips)/tripPlanSecond");
        }}
      />

      <Modal transparent animationType="fade" visible={calendarVisible}>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View style={{ maxHeight: "80%" }}>
              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={onDayPress}
                theme={{
                  textDayFontSize: moderateScale(16),
                  textMonthFontSize: moderateScale(20),
                  textDayHeaderFontSize: moderateScale(14),
                  monthTextColor: "#9d9d9d",
                  textSectionTitleColor: "#9d9d9d",
                  selectedDayBackgroundColor: "#FF8820",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#FF8820",
                  arrowColor: "#9d9d9d",
                  dotColor: "#FF8820",
                  calendarBackground: "white",
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
                  <Text style={[styles.closeText, { color: "#FF8820", fontWeight: "700" }]}>
                    Submit
                  </Text>
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
  inputBar: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  errorBorder: {
    borderColor: "rgba(255, 0, 0, 0.35)",
    borderWidth: 2,
  },

  label: {
    fontSize: moderateScale(15),
    color: "#9d9d9d",
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "600",
  },

  inputText: {
    fontSize: moderateScale(15),
    color: "black",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  popup: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: moderateScale(16),
    padding: verticalScale(16),
    elevation: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  closeText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: moderateScale(16),
    color: "#FF8820",
  },

  screen: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 15,
  },

  header: {
    marginTop: -15,
    fontSize: moderateScale(28),
    fontWeight: "700",
  },

  subHeader: {
    fontSize: moderateScale(15),
    fontWeight: 15,
    marginBottom: 30,
    color: "#626262",
  },
});