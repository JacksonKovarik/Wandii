import React, { useRef, useState } from "react";
import {
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
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
          paddingRight: scale(40), // space for index
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
          <Pressable
            key={letter}
            android_ripple={{ color: "transparent" }}
            onPressIn={() => {
              setActiveLetter(letter);
              scrollToLetter(letter, true);
            }}
            onPressOut={() => setActiveLetter(null)}
            style={[
              styles.letterHitbox,
              activeLetter === letter && styles.activeCircle,
            ]}
          >
            <Text style={styles.rightIndexLetter}>{letter}</Text>
          </Pressable>
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
    width: scale(40), // big touch area, but visually compact letters
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    pointerEvents: "box-none",
  },

  // BIG invisible hitbox, but visually compact
  letterHitbox: {
    width: scale(40),
    height: verticalScale(14), // big touch height
    justifyContent: "center",
    alignItems: "center",

    // Pull letters visually closer together
    marginVertical: -verticalScale(4),
  },

  rightIndexLetter: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#FF8820",
    lineHeight: moderateScale(12),
    textAlign: "center",
  },

  activeCircle: {
    backgroundColor: "rgba(255, 136, 32, 0.18)",
    borderRadius: scale(12),
    paddingHorizontal: scale(4),
    paddingVertical: verticalScale(2),
  },
});