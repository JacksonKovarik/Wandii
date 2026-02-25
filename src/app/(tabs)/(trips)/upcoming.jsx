import AddTripButton from "@/src/components/addTripButton";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function Upcoming() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Plan a New Adventure</Text>
        <AddTripButton
          bgColor="#e5e5e5"
          iconColor="#9d9d9d"
          size={60}
          centered={true}
        />
      </View>

      <Link href="/(trip-info)/1/overview">Go To Trip Info</Link>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },

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

  emptyText: {
    fontSize: moderateScale(18),       
    color: "#9d9d9d",
    marginBottom: 20,
  },
});
