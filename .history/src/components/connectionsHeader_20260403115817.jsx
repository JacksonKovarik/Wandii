import { StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function ConnectionsHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Connections</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    shadowColor: "#9D9D9D",
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    shadowOpacity: 0.4,
    shadowRadius: 0.8,
    shadowOffset: { width: 0, height: 2 },
  },

  headerContent: {
    marginTop: 60,
    marginBottom: 10,
  },

  titleRow: {
    flexDirection: "row",
    marginHorizontal: "5%",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  title: {
    fontSize: moderateScale(34),
    fontWeight: "bold",
    marginBottom: 5,
  },
});