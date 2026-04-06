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

export default function FriendsSectionList({ sections }) {
  const sectionListRef = useRef(null);

  const [activeLetter, setActiveLetter] = useState("A");
  const [search, setSearch] = useState("");

  const TRACKING_BAR_HEIGHT = verticalScale(26);

  // FILTERED SECTIONS
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

  // TRACK CURRENT SECTION WHILE SCROLLING
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const first = viewableItems.find((v) => v.section);
    if (first?.section?.title) {
      setActiveLetter(first.section.title);
    }
  }).current;

  return (
    <View style={{ flex: 1 }}>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
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
      </View>

      {/* TRACKING BAR */}
      <View style={styles.trackingBar}>
        <Text style={styles.trackingLetter}>{activeLetter}</Text>
      </View>

      {/* MAIN LIST */}
      <SectionList
        ref={sectionListRef}
        sections={filteredSections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 10 }}
        contentContainerStyle={{
          paddingTop: TRACKING_BAR_HEIGHT,
          paddingLeft: scale(10),
          paddingRight: scale(10),
          paddingBottom: verticalScale(20),
        }}
        renderSectionHeader={({ section, index }) => {
          const isActive = activeLetter === section.title;
          const isFirst = index === 0;

          return (
            <View
              style={[
                styles.sectionHeaderContainer,
                isFirst && styles.firstSectionHeaderContainer
              ]}
            >
              <Text
                style={[
                  styles.sectionHeader,
                  isActive && styles.invisibleHeaderText,
                  isFirst && styles.firstHeaderFix
                ]}
              >
                {section.title}
              </Text>
            </View>
          );
        }}
        renderItem={({ item, section, index }) => {
          const isFirstSection = section.title === filteredSections[0]?.title;
          const isFirstItem = index === 0;

          return (
            <View
              style={[
                styles.friendRow,
                isFirstSection && isFirstItem && styles.firstItemFix
              ]}
            >
              <Image source={item.avatar} style={styles.avatar} />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtitle}>
                  {item.tripsTogether} Trips Together
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: scale(10),
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

  /* TRACKING BAR */
  trackingBar: {
    height: verticalScale(26),
    justifyContent: "center",
    paddingLeft: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    zIndex: 50,
  },

  trackingLetter: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#FF8820",
  },

  /* SECTION HEADER */
  sectionHeaderContainer: {
    backgroundColor: "#FFFFFF",
    height: verticalScale(26),
    justifyContent: "center",
  },

  /* ⭐ REMOVE TOP SPACE FOR FIRST SECTION */
  firstSectionHeaderContainer: {
    height: verticalScale(20),
  },

  sectionHeader: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#CCCCCC",
    paddingTop: verticalScale(10),
  },

  /* ⭐ REMOVE HEADER PADDING FOR FIRST SECTION */
  firstHeaderFix: {
    paddingTop: 0,
  },

  invisibleHeaderText: {
    color: "transparent",
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

  /* ⭐ REMOVE TOP PADDING FROM FIRST ITEM IN FIRST SECTION */
  firstItemFix: {
    paddingTop: 0,
    marginTop: -verticalScale(30),
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