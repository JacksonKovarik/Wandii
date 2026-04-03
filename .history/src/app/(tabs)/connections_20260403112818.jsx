import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import FriendsSectionList from "../components/friendsSectionList";
import { fakeFriends } from "../data/fakeFriends";
import { groupByLetter } from "../utils/groupByLetter";

export default function Explore() {
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