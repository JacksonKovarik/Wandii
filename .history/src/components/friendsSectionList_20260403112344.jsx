import { Image, SectionList, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// renders the alphabetical friends list
export default function FriendsSectionList({ sections }) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: verticalScale(10) }}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.friendRow}>
          <Image source={item.avatar} style={styles.avatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subtitle}>
              {item.tripsTogether} Trips Together
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(6),
    color: "#555",
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    marginRight: scale(14),
  },

  name: {
    fontSize: moderateScale(17),
    fontWeight: "600",
  },

  subtitle: {
    fontSize: moderateScale(13),
    color: "#8A8A8A",
    marginTop: verticalScale(2),
  }, 
});