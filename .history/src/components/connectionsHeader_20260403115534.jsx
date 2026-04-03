import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function ConnectionsHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(14),
    paddingHorizontal: scale(20),
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
  },
});