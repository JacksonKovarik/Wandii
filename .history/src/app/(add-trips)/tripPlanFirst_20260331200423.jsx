import CalendarPicker from "@/src/components/calendarPicker";
import NextStepButton from "@/src/components/nextStepButton";
import DateUtils from "@/src/utils/DateUtils";
import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function TripPlanFirst() {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const formattedDates = DateUtils.formatDateRange(startDate, endDate);

  return (
    <View style={styles.screen}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.header}>Let's Start Planning</Text>
          <Text style={styles.subHeader}>
            Where is your next adventure taking you?
          </Text>

          <Text style={styles.label}>Destination</Text>
          <View style={styles.inputBar}>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Kyoto, Japan"
              placeholderTextColor="#9d9d9d"
              style={styles.inputText}
              maxLength={40}
            />
          </View>

          <Text style={styles.label}>Trip Name</Text>
          <View style={styles.inputBar}>
            <TextInput
              value={tripName}
              onChangeText={setTripName}
              placeholder="e.g. Spring Cherry Blossoms"
              placeholderTextColor="#9d9d9d"
              style={styles.inputText}
              maxLength={34}
            />
          </View>

          <Text style={styles.label}>Dates</Text>
          <TouchableOpacity
            style={styles.inputBar}
            onPress={() => setCalendarVisible(true)}
          >
            <Text
              style={[
                styles.inputText,
                { color: startDate && endDate ? "black" : "#9d9d9d" },
              ]}
              numberOfLines={1}
            >
              {formattedDates}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      <NextStepButton href="/(add-trips)/tripPlanSecond" />

      <CalendarPicker
        visible={calendarVisible}
        initialStart={startDate}
        initialEnd={endDate}
        onClose={() => setCalendarVisible(false)}
        onSubmit={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
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
  screen: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
    paddingTop: verticalScale(15),
    paddingHorizontal: moderateScale(10),
  },
  header: {
    fontSize: moderateScale(28),
    fontWeight: "700",
  },
  subHeader: {
    fontSize: moderateScale(15),
    marginBottom: verticalScale(30),
    color: "#626262",
  },
});
