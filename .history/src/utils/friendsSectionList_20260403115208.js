import React, { useRef } from "react";
import { Image, SectionList, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function FriendsSectionList({ sections }) {
  const sectionListRef = useRef(null);

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        ref={sectionListRef}
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

      {/* A–Z index */}
      <View style={styles.indexContainer}>
        {sections.map((section, index) => (
          <Text
            key={section.title}
            style={styles.indexLetter}
            onPress={() => {
              sectionListRef.current?.scrollToLocation({
                sectionIndex: index,
                itemIndex: 0,
                animated: true,
              });
            }}
          >
            {section.title}
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

  indexContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingRight: scale(4),
  },

  indexLetter: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#888",
    paddingVertical: verticalScale(2),
  },
});