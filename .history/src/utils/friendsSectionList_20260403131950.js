import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function FriendsSectionList({ sections }) {
  const sectionListRef = useRef(null);
  const dragZoneRef = useRef(null);

  const [activeLetter, setActiveLetter] = useState("A");
  const [dragZoneTop, setDragZoneTop] = useState(0);
  const [search, setSearch] = useState("");

  const LETTER_HEIGHT = 12;

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;

    return sections
      .map((section) => ({
        ...section,
        data: section.data.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((section) => section.data.length > 0);
  }, [search, sections]);

  const scrollToLetter = (letter, animated = true) => {
    const sectionIndex = filteredSections.findIndex((s) => s.title === letter);
    if (sectionIndex === -1) return;

    sectionListRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      animated,
      viewPosition: 0,
      viewOffset: 0,
    });
  };

  const measureDragZone = () => {
    dragZoneRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDragZoneTop(pageY);
    });
  };

  const handleDrag = (e) => {
    const fingerY = e.nativeEvent.pageY;
    const y = fingerY - dragZoneTop;

    const index = Math.floor(y / LETTER_HEIGHT);
    const letter = ALPHABET[index];

    if (!letter) return;

    setActiveLetter(letter);
    scrollToLetter(letter, false);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const first = viewableItems.find((v) => v.section);
    if (first?.section?.title) {
      setActiveLetter(first.section.title);
    }
  }).current;

  return (
    <View style={{ flex: 1 }}>

      {/* HEADER WITH SEARCH + TRACKING BAR */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search friends"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.trackingBar}>
          <Text style={styles.trackingLetter}>{activeLetter}</Text>
        </View>
      </View>

      <SectionList
        ref={sectionListRef}
        sections={filteredSections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 10 }}
        contentContainerStyle={{
          paddingLeft: scale(10),
          paddingRight: scale(40),
          paddingBottom: verticalScale(20),
        }}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text
              style={[
                styles.sectionHeader,
                activeLetter === section.title && styles.hiddenHeader
              ]}
            >
              {section.title}
            </Text>
          </View>
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

      {!search && (
        <View style={styles.rightIndexContainer} pointerEvents="box-none">
          <View
            ref={dragZoneRef}
            style={styles.dragZone}
            onLayout={measureDragZone}
            onStartShouldSetResponder={() => true}
            onResponderMove={handleDrag}
            onResponderRelease={() => {}}
          >
            {ALPHABET.map((letter) => (
              <View key={letter} style={styles.letterRow}>
                <Text style={styles.rightIndexLetter}>{letter}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: verticalScale(4),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: scale(10),
    marginHorizontal: scale(12),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(8),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
  },

  searchIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(8),
    color: "#999",
  },

  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#000",
    paddingVertical: 0,
  },

  trackingBar: {
    height: verticalScale(24),
    justifyContent: "center",
    paddingLeft: scale(12),
    backgroundColor: "#F3F4F6",
  },

  trackingLetter: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#555555",
  },

  sectionHeaderContainer: {
    backgroundColor: "#FFFFFF",
  },

  sectionHeader: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(6),
    color: "#CCCCCC",
  },

  hiddenHeader: {
    opacity: 0,
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 0,
    fontSize: 0,
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
    top: verticalScale(80),
    bottom: verticalScale(10),
    width: scale(40),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  dragZone: {
    width: scale(22),
    justifyContent: "center",
    alignItems: "center",
  },

  letterRow: {
    height: verticalScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  rightIndexLetter: {
    fontSize: moderateScale(9),
    fontWeight: "700",
    color: "#555555",
    lineHeight: moderateScale(9),
  },
});