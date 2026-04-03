import React, { useRef } from "react";
import { Image, SectionList, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Short iOS-style index
const SHORT_INDEX = ["A", "D", "G", "J", "M", "P", "S", "V", "Z"];

export default function FriendsSectionList({ sections }) {
  const sectionListRef = useRef(null);

  return (
    <View style={{ flex: 1 }}>
      {/* MAIN LIST */}
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: verticalScale(10),
          paddingLeft: scale(10),
          paddingRight: scale(10),
        }}
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

      {/* RIGHT-SIDE DRAGGABLE INDEX */}
      <View
        style={styles.rightIndexContainer}
        onStartShouldSetResponder={() => true}
        onResponderMove={(e) => {
          const y = e.nativeEvent.locationY;
          const index = Math.floor(y / 22); // each letter ~22px tall
          const letter = SHORT_INDEX[index];

          if (!letter) return;

          const sectionIndex = sections.findIndex((s) => s.title === letter);
          if (sectionIndex !== -1) {
            sectionListRef.current?.scrollToLocation({
              sectionIndex,
              itemIndex: 0,
              animated: false,
            });
          }
        }}
      >
        {SHORT_INDEX.map((letter) => (
          <Text key={letter} style={styles.rightIndexLetter}>
            {letter}
          </Text>
        ))}
      </View>
    </View>
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

  avatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    marginRight: scale(12),
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
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

  // RIGHT INDEX (iOS-style)
  rightIndexContainer: {
    position: "absolute",
    right: scale(10),
    top: "30%",
    width: scale(20),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  rightIndexLetter: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#FF8820", // your brand orange
    paddingVertical: verticalScale(2),
  },
});