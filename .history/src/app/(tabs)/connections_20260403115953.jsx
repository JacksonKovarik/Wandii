import ConnectionsHeader from "@/components/connectionsHeader";
import FriendsSectionList from "@/utils/friendsSectionList";
import { StyleSheet, View } from "react-native";

import { fakeFriends } from "@/data/fakeFriends";
import { groupByLetter } from "@/utils/groupByLetter";

export default function Connections() {
  const sections = groupByLetter(fakeFriends);

  return (
    <View style={styles.container}>
      {/* Premium header that matches My Trips */}
      <ConnectionsHeader />

      {/* Friends list with A–Z index */}
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