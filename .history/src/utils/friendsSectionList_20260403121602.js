import React, { useRef } from "react";
import { Image, SectionList, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
          paddingHorizontal: scale(10),
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

      {/* RIGHT-SIDE FULL A–Z DRAGGABLE INDEX (COMPACT) */}
      <View
        style={styles.rightIndexContainer}
        onStartShouldSetResponder={() => true}
        onResponderMove={(e) => {
          const y = e.nativeEvent.locationY;
          const index = Math.floor(y / 14); // tighter spacing = more compact
          const letter = ALPHABET[index];

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
        {ALPHABET.map((letter) => {
          const sectionIndex = sections.findIndex((s) => s.title === letter);

          return (
            <Text
              key={letter}
              style={[
                styles.rightIndexLetter,
                sectionIndex === -1 && { opacity: 0.25 },
              ]}
              onPress={() => {
                if (sectionIndex !== -1) {
                  sectionListRef.current?.scrollToLocation({
                    sectionIndex,
                    itemIndex: 0,
                    animated: true,
                  });
                }
              }}
            >
              {letter}
            </Text>
          );
        })}
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

  // RIGHT INDEX (compact, smooshed)
  rightIndexContainer: {
    position: "absolute",
    right: scale(6),
    top: verticalScale(40),
    bottom: verticalScale(40),
    width: scale(18),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  rightIndexLetter: {
    fontSize: moderateScale(10),   // smaller text
    fontWeight: "700",
    color: "#FF8820",              // brand orange
    paddingVertical: verticalScale(1), // tight spacing
    lineHeight: moderateScale(12),     // smooshed look
  },
});