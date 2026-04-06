import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// import placeholder data
import { fakeFriends } from "../../data/fakeFriends";

// import alphabetical grouping function
import { groupByLetter } from "../../utils/groupByLetter";

// import the UI component
import FriendsSectionList from "../../components/friendsSectionList";

export default function Connections() {
  // grouped alphabetical sections
  const sections = groupByLetter(fakeFriends);

  return (
    <View style={styles.container}>
      {/* screen title */}
      <Text style={styles.header}>Connections</Text>

      {/* alphabetical list */}
      <FriendsSectionList sections={sections} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    backgroundColor: "white",
  },

  header: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    marginBottom: verticalScale(10),
  },
});