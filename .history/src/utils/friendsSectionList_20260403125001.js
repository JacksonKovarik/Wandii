import React, { useRef, useState } from "react";
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function FriendsSectionList({ sections }) {
  const sectionListRef = useRef(null);
  const [activeLetter, setActiveLetter] = useState(null);

  const scrollToLetter = (letter, animated = true) => {
    const sectionIndex = sections.findIndex((s) => s.title === letter);
    if (sectionIndex === -1) return;

    sectionListRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      animated,
      viewPosition: 0,
      viewOffset: 0,
    });
  };

  const handleDrag = (e) => {
    const y = e.nativeEvent.locationY;
    const index = Math.floor(y / 14); // 14px per letter
    const letter = ALPHABET[index];
    if (!letter) return;

    setActiveLetter(letter);
    scrollToLetter(letter, false);
  };

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
          paddingRight: scale(40),
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

      {/* RIGHT-SIDE INDEX */}
      <View style={styles.rightIndexContainer} pointerEvents="box-none">
        {ALPHABET.map((letter) => (
          <View
            key={letter}
            style={styles.letterHitbox}
            onStartShouldSetResponder={() => true}
            onResponderMove={handleDrag}
            onResponderRelease={() => setActiveLetter(null)}
          >
            {/* SMALL CIRCLE */}
            <View
              style={[
                styles.circle,
                activeLetter === letter && styles.circleActive,
              ]}
            />

            {/* LETTER */}
            <Text style={styles.rightIndexLetter}>{letter}</Text>
          </View>
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

  rightIndexContainer: {
    position: "absolute",
    right: scale(6),
    top: verticalScale(10),
    bottom: verticalScale(10),
    width: scale(40),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    pointerEvents: "box-none",
  },

  // LARGE INVISIBLE TOUCH AREA
  letterHitbox: {
    width: scale(40),
    height: verticalScale(14),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // SMALL CIRCLE THAT DOES NOT MOVE ANYTHING
  circle: {
    position: "absolute",
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: "transparent",
  },

  circleActive: {
    backgroundColor: "rgba(255, 136, 32, 0.25)",
  },

  // SUPER COMPACT LETTER
  rightIndexLetter: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#FF8820",
    lineHeight: moderateScale(10),
    textAlign: "center",
    paddingVertical: 0,
    marginVertical: 0,
  },
});