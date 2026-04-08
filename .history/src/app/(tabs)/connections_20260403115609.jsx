import { StyleSheet, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import ConnectionsHeader from "@/components/headers/ConnectionsHeader";
import FriendsSectionList from "@/utils/friendsSectionList";

import { fakeFriends } from "@/data/fakeFriends";
import { groupByLetter } from "@/utils/groupByLetter";

export default function Connections() {
  const sections = groupByLetter(fakeFriends);

  return (
    <View style={styles.container}>
      <ConnectionsHeader />

      <View style={styles.listWrapper}>
        <FriendsSectionList sections={sections} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  listWrapper: {
    flex: 1,
    paddingHorizontal: scale(0),
    paddingTop: verticalScale(0),
  },
});