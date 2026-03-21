import AddTripButton from "@/src/components/addTripButton";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function Upcoming() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.emptyBox}>
        <View>
          <AddTripButton
            bgColor="#e5e5e5"
            iconColor="#c7c7c7"
            size={60}
            centered={true}
        />
        </View>
        <Text style={styles.emptyText}>Plan a New Adventure</Text>

      </View>
    </ScrollView>
  );
}

// Main content container format
const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Formatting for dashed box used for empty state
  emptyBox: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#9d9d9d",
    borderStyle: "dashed",
    borderRadius: moderateScale(16),   
    paddingVertical: verticalScale(40), 
    justifyContent: "center",
    alignItems: "center",
  },

  // Formatting for text shown in empty state
  emptyText: {
    fontSize: moderateScale(18),       
    color: "#9d9d9d",
    marginBottom: 20,
  },
});
