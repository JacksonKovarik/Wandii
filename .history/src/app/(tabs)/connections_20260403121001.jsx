import ConnectionsHeader from "@/src/components/connectionsHeader";
import FriendsSectionList from "@/src/utils/friendsSectionList";
import { StyleSheet, View } from "react-native";

import { fakeFriends } from "@/src/data/fakeFriends";
import { groupByLetter } from "@/src/utils/groupByLetter";

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
  },
});