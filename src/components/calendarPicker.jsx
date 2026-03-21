import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function CalendarPicker({
  visible,
  initialStart,
  initialEnd,
  onClose,
  onSubmit,
}) {
  const [tempStart, setTempStart] = useState(initialStart);
  const [tempEnd, setTempEnd] = useState(initialEnd);

  useEffect(() => {
    if (visible) {
      setTempStart(initialStart);
      setTempEnd(initialEnd);
    }
  }, [visible, initialStart, initialEnd]);

  const onDayPress = (day) => {
    const date = day.dateString;

    if (tempEnd && date === tempEnd) {
      setTempEnd(null);
      return;
    }

    if (tempStart && date === tempStart) {
      setTempStart(null);
      setTempEnd(null);
      return;
    }

    if (!tempStart) {
      setTempStart(date);
      setTempEnd(null);
      return;
    }

    if (tempStart && !tempEnd) {
      if (new Date(date) < new Date(tempStart)) return;
      setTempEnd(date);
      return;
    }

    setTempStart(date);
    setTempEnd(null);
  };

  const markedDates = {};

  if (tempStart) {
    markedDates[tempStart] = {
      startingDay: true,
      color: "#FF8820",
      textColor: "white",
    };
  }

  if (tempStart && tempEnd) {
    let current = new Date(tempStart);
    const last = new Date(tempEnd);

    current.setDate(current.getDate() + 1);

    while (current < last) {
      const dateString = current.toISOString().split("T")[0];
      markedDates[dateString] = {
        color: "#FFB97A",
        textColor: "white",
      };
      current.setDate(current.getDate() + 1);
    }

    markedDates[tempEnd] = {
      endingDay: true,
      color: "#FF8820",
      textColor: "white",
    };
  }

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
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

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSubmit(tempStart, tempEnd);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.closeText,
                  { color: "#FF8820", fontWeight: "700" },
                ]}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  closeText: {
    fontSize: moderateScale(16),
    color: "#FF8820",
  },
});




