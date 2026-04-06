import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const fakeFriends = [
  {
    id: "1",
    name: "Jordan Lee",
    avatar: require("../../assets/images/avatar1.png"),
    subtitle: "3 trips together",
  },
  {
    id: "2",
    name: "Ava Martinez",
    avatar: require("../../assets/images/avatar2.png"),
    subtitle: "Last trip: Paris 2025",
  },
  {
    id: "3",
    name: "Marcus Chen",
    avatar: require("../../assets/images/avatar3.png"),
    subtitle: "Travel companion",
  },
];

export default function Explore() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connections</Text>

      <FlatList
        data={fakeFriends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: verticalScale(10) }}
        renderItem={({ item }) => (
          <View style={styles.friendRow}>
            <Image source={item.avatar} style={styles.avatar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />
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