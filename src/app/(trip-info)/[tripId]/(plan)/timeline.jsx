import ReusableTabBar from "@/src/components/reusableTabBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { useTrip } from "@/src/utils/TripContext";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function Timeline() {
  
  const tripData = useTrip();
  const { timelineData = {} } = tripData

  const [selectedDate, setSelectedDate] = useState(null); // Default selected date, can be set to null or a specific date string
  
  const setInitialSelectedDate = (dateStr) => {
      const dateObj = DateUtils.parseYYYYMMDDToDate(dateStr);
      setSelectedDate(dateObj);
  };

  // const timelineData = {
  //   '2023-10-12': [
  //     { id: '1', time: '9:00 AM', title: 'Meiji Shrine', category: 'Culture', type: 'event' },
  //     { id: '2', time: '12:30 PM', title: 'Ichiran Ramen', category: 'Lunch Reservation', type: 'event' },
  //     { id: '3', title: '3 hour time gap', type: 'gap' },
  //     { id: '4', time: '4:30 PM', title: 'Tokyo Skytree', category: 'Sightseeing', type: 'event' },
  //   ],
  //   '2023-10-13': [
  //     { id: '5', time: '10:00 AM', title: 'Ghibli Museum', category: 'Museum', type: 'event' },
  //     { id: '6', title: '2 hour time gap', type: 'gap' },
  //     { id: '7', time: '1:00 PM', title: 'Shibuya Crossing', category: 'Sightseeing', type: 'event' },
  //     { id: '8', time: '3:00 PM', title: 'Hachiko Statue', category: 'Landmark', type: 'event' },
  //     { id: '9', time: '7:00 PM', title: 'Dinner in Shinjuku', category: 'Food', type: 'event' },
  //   ],
  //   '2023-10-14': [
  //     { id: '10', time: '11:00 AM', title: 'Ueno Park & Zoo', category: 'Leisure', type: 'event' },
  //     { id: '11', time: '2:00 PM', title: 'Tokyo National Museum', category: 'Museum', type: 'event' },
  //     { id: '12', title: '4 hour time gap', type: 'gap' },
  //     { id: '13', time: '7:30 PM', title: 'Robot Restaurant Show', category: 'Entertainment', type: 'event' },
  //   ],
  //   '2023-10-15': [], // A day with no events
  //   '2023-10-16': [
  //     { id: '14', time: '9:30 AM', title: 'Day trip to Hakone', category: 'Excursion', type: 'event' },
  //     { id: '15', time: '12:00 PM', title: 'Lake Ashi Cruise', category: 'Activity', type: 'event' },
  //     { id: '16', time: '3:00 PM', title: 'Hakone Ropeway', category: 'Sightseeing', type: 'event' },
  //   ],
  //   '2023-10-17': [
  //     { id: '17', time: '10:00 AM', title: 'Akihabara Electric Town', category: 'Shopping', type: 'event' },
  //     { id: '18', time: '1:00 PM', title: 'Maid Cafe Experience', category: 'Food & Culture', type: 'event' },
  //   ],
  //   '2023-10-18': [
  //     { id: '19', time: 'All Day', title: 'Free Day / Shopping', category: 'Leisure', type: 'event' },
  //   ],
  //   '2023-10-19': [
  //     { id: '20', time: '8:00 AM', title: 'Tsukiji Outer Market', category: 'Food', type: 'event' },
  //     { id: '21', title: '2 hour time gap', type: 'gap' },
  //     { id: '22', time: '11:00 AM', title: 'Imperial Palace East Garden', category: 'History', type: 'event' },
  //   ],
  // };
  
  const getSelectedDateData = () => {
    if (!selectedDate) return [];
    const dateString = DateUtils.formatDateToYYYYMMDD(selectedDate);
    return timelineData[dateString] || [];
  };

  const currentDayData = getSelectedDateData();

  const DateBadge = ({ date }) => {
      const dateObj = DateUtils.parseYYYYMMDDToDate(date);
      
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      const day = dateObj.getDate();

      const isSelected = selectedDate?.getTime() === dateObj.getTime();

      return (
          <TouchableOpacity 
              style={[
                  styles.dateBadge, 
                  isSelected ? styles.dateBadgeSelected : styles.dateBadgeUnselected
              ]} 
              onPress={() => setSelectedDate(dateObj)}
          >
              <Text 
                  style={[
                      styles.dateBadgeDayText,
                      isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeTextUnselected
                  ]}
              >{day}</Text>
              <Text style={[
                  styles.dateBadgeDayOfWeekText,
                  isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeDayOfWeekTextUnselected
              ]}>{dayOfWeek}</Text>
          </TouchableOpacity>
      );
  };

  const TimelineList = ({ item, index }) => {
      const isLast = index === currentDayData.length - 1;
      return (
          <View style={styles.itemContainer}>
              {/* Left Side: Timeline Track */}
              <View style={styles.timelineContainer}>
                  {/* Vertical Line */}
                  <View style={[
                      styles.line,
                      isLast && styles.lastLine,
                  ]} />
                  
                  {/* The Dot Node */}
                  <View style={[
                      styles.dot,
                      item.type === 'gap' && styles.gapDot, // Solid grey for gap
                  ]} />
              </View>

              {/* Right Side: Content */}
              <View style={styles.contentContainer}>
                  {item.type === 'event' ? (
                      <View style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.category}>{item.category}</Text>
                          </View>

                          {/* Image for event */}
                          <View style={{ width: '25%', height: '100%', borderRadius: 10, backgroundColor: Colors.lightGray}} />
                        </View>
                      </View>
                  ) : (
                      // Render the "Gap" text differently
                      <View style={styles.gapContainer}>
                          <Text style={styles.gapText}>{item.title}</Text>
                      </View>
                  )}
              </View>
          </View>
      );
  };

  useEffect(() => {
      // This effect runs once on mount to set the initial selected date
      setInitialSelectedDate("2023-10-12");
  }, []);

    return (
        <ScrollView style={styles.screen}>
            {/* Tab Bar */}
            <View style={styles.tabBarOuterContainer}>
                <View style={styles.tabBarInnerContainer}>
                    <ReusableTabBar 
                        tabs={[
                          { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripData.id}/(plan)/idea-board` },
                          { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripData.id}/(plan)/timeline` },
                          { label: "Map", name: "map", route: `/(trip-info)/${tripData.id}/(plan)/map` },
                          { label: "Stays", name: "stays", route: `/(trip-info)/${tripData.id}/(plan)/stays` },
                        ]}
                    />
                </View>
            </View>

            {/* Timeline */}
            <View style={styles.dateScrollerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroller} contentContainerStyle={styles.dateScrollerContent}>
                    <DateBadge date="2023-10-12" />
                    <DateBadge date="2023-10-13" />
                    <DateBadge date="2023-10-14" />
                    <DateBadge date="2023-10-15" />
                    <DateBadge date="2023-10-16" />
                    <DateBadge date="2023-10-17" />
                    <DateBadge date="2023-10-18" />
                    <DateBadge date="2023-10-19" />
                </ScrollView>
            </View>

            <View style={styles.timelineListContainer}>
              <View style={{ flexDirection: 'row' }}>
                  <View style={styles.timelineContainer}>
                      {/* Vertical Line */}
                      <View style={[
                          styles.line, 
                          { top: moderateScale(10) } 
                      ]} />
                      <View style={[
                          styles.dot,
                          styles.startDot, // Solid orange for start
                      ]} />
                  </View>
                  
                  <View style={styles.headerContainer}>
                      <Text style={styles.headerDate}>{selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null}</Text>
                      <Text style={styles.headerSubtitle}>{currentDayData.filter(i => i.type === 'event').length} Events Scheduled</Text>
                  </View>
              </View>
              { currentDayData.map((item, index) => (
                  <TimelineList key={item.id} item={item} index={index} />
              )) }
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // --- Tab Bar ---
  tabBarOuterContainer: {
    padding: 10,
    marginBottom: 10,
  },
  tabBarInnerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  reusableTabBarBg: {
    backgroundColor: '#E0E0E0',
    width: '75%',
  },
  reusableTabBarText: {
    fontSize: 14,
  },
  // --- Date Scroller ---
  dateScrollerContainer: {
    flex: 1,
    paddingHorizontal: '5%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateScroller: {
    backgroundColor: 'white',
    borderRadius: 20,
  },
  dateScrollerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  // --- Date Badge ---
  dateBadge: {
    width: moderateScale(65),
    paddingVertical: moderateScale(17),
    borderRadius: 10,
    alignItems: 'center',
    gap: moderateScale(5),
  },
  dateBadgeSelected: {
    backgroundColor: Colors.primary,
  },
  dateBadgeUnselected: {
    backgroundColor: Colors.lightGray,
  },
  dateBadgeDayText: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  dateBadgeDayOfWeekText: {
    fontSize: moderateScale(17),
    fontWeight: 'bold',
  },
  dateBadgeTextSelected: {
    color: 'white',
  },
  dateBadgeTextUnselected: {
    color: Colors.textSecondary,
  },
  dateBadgeDayOfWeekTextUnselected: {
    color: Colors.textSecondaryDark,
  },
  // --- Timeline List ---
  timelineListContainer: {
    paddingHorizontal: '5%',
  },
  container: { // Note: This style was defined but not used in the original code.
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: { // Note: This style was defined but not used in the original code.
    padding: 20,
    paddingTop: 40,
  },
  itemContainer: {
    flexDirection: 'row',
  },
  // --- TIMELINE STYLES ---
  timelineContainer: {
    width: 40, 
    alignItems: 'center',
  },
  line: {
    width: 2,
    backgroundColor: '#D3D3D3',
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  lastLine: {
    bottom: '50%',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff', // White fill to hide the line behind it
    borderWidth: 2,
    borderColor: Colors.primary, 
    marginTop: moderateScale(42), // Push dot down to align with card top
    zIndex: 1, // Ensure dot sits on top of the line
  },
  headerLine: {
    top: moderateScale(10),
  },
  startDot: {
    backgroundColor: Colors.primary, 
    borderColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: 10, // Adjust slightly for size difference
  },
  gapDot: {
    backgroundColor: Colors.gray, // Grey
    borderColor: Colors.gray,
    width: 14,
    height: 14,
    marginTop: 25,
  },

  // --- CONTENT STYLES ---
  contentContainer: {
    flex: 1,
    paddingBottom: 30, 
    paddingLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeBadge: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    color: '#777',
    fontSize: 14,
  },
  gapContainer: {
    height: 60, 
    justifyContent: 'center',
    paddingTop: 10,
  },
  gapText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
// --- HEADER STYLES ---
    headerContainer: {
        marginBottom: 20,
    },
    headerDate: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000',
        lineHeight: 34,
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginTop: 4,
    },
});