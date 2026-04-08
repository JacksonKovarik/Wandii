import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// correct path: 2 levels up to reach src/
import { fakeFriends } from "../../data/fakeFriends.js";
import { groupByLetter } from "../../utils/groupByLetter";

// correct path: 2 levels up to reach src/
import FriendsSectionList from "../../utils/friendsSectionList.js";

export default function Connections() {
  const sections = groupByLetter(fakeFriends);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connections</Text>
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