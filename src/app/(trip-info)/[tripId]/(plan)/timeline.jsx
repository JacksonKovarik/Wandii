import ReusableTabBar from "@/src/components/reusableTabBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ReorderableList, { reorderItems, useIsActive, useReorderableDrag } from 'react-native-reorderable-list';
import { moderateScale } from "react-native-size-matters";

// 1. THE "ANYTIME" CARD (Draggable, no timeline line)
const AnytimeEventCard = ({ item, onSetTime }) => {
    const drag = useReorderableDrag();
    const isActive = useIsActive();

    return (
        <Pressable 
            onLongPress={drag}
            delayLongPress={150}
            style={[styles.itemContainer, isActive && { opacity: 0.7, transform: [{ scale: 1.02 }] }]}
        >
            <View style={[styles.contentContainer, { paddingLeft: 0, width: '100%' }]}>
                <View style={[styles.card, isActive && { shadowOpacity: 0.3, elevation: 8, borderColor: Colors.primary, borderWidth: 1 }]}>    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{ width: '27%', height: 65, borderRadius: 10, backgroundColor: Colors.lightGray}} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.setTimeButton} onPress={() => onSetTime(item.id)}>
                            <Text style={styles.setTimeText}>Set Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

// 2. THE "SCHEDULED" CARD (Fixed, not draggable, has timeline line)
const ScheduledEventCard = ({ item, isLast, onSetTime }) => {
    return (
        <View style={styles.itemContainer}>
            <View style={styles.timelineContainer}>
                <View style={[styles.line, isLast && styles.lastLine]} />
                <View style={[styles.dot]} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <TouchableOpacity style={styles.timeBadge} onPress={() => onSetTime(item.id)}>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.category}>{item.category}</Text>
                        </View>
                        <View style={{ width: '25%', height: '100%', borderRadius: 10, backgroundColor: Colors.lightGray}} />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default function Timeline() {
  const tripData = useTrip();
  const { timelineData = {}, addEventToBucket, updateDayEvents, unassignedIdeas = [] } = tripData;

  // --- STATE ---
  const [selectedDate, setSelectedDate] = useState(null);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

    // --- DERIVED STATE & CONSTANTS ---
    const activeDateStr = selectedDate ? DateUtils.formatDateToYYYYMMDD(selectedDate) : null;

    useEffect(() => {
        setInitialSelectedDate("2023-10-12");
    }, []);
  
    const showTimePicker = (itemId) => {
        setSelectedItemId(itemId);
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
        setSelectedItemId(null);
    };

    const handleConfirmTime = (date) => {
        if (!selectedItemId || !activeDateStr) return;

        // 1. Format the raw Date object into your "h:mm A" string
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedTime = `${hours}:${paddedMinutes} ${ampm}`;

        // 2. Update the specific item in the current day's data
        const updatedDayData = currentDayData.map(item => {
            if (item.id === selectedItemId) {
                return { ...item, time: formattedTime };
            }
            return item;
        });

        // 3. Save it back to context (this instantly moves it to the sorted timeline!)
        updateDayEvents(activeDateStr, updatedDayData);
        hideTimePicker();
    };

    const setInitialSelectedDate = (dateStr) => {
        const dateObj = DateUtils.parseYYYYMMDDToDate(dateStr);
        setSelectedDate(dateObj);
    };
  
    // --- DATA SPLITTING & SORTING LOGIC ---
  
    const parseTimeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    const getSelectedDateData = () => {
        if (!selectedDate) return [];
        const dateString = DateUtils.formatDateToYYYYMMDD(selectedDate);
        return timelineData[dateString] || [];
    };

    const currentDayData = getSelectedDateData();

    // 1. Filter out items with no time set ('TBD')
    const flexibleBucket = currentDayData.filter(e => !e.time || e.time === 'TBD' || e.time === 'All Day');
  
    // 2. Filter items WITH times and strictly sort them chronologically
    const anchoredTimeline = currentDayData
      .filter(e => e.time && e.time !== 'TBD' && e.time !== 'All Day')
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    const reorderBucket = ({ from, to }) => {
      if (!activeDateStr) return;
      const reorderedAnytime = reorderItems(flexibleBucket, from, to);
      // Merge the reordered anytime bucket back with the scheduled events and save
      updateDayEvents(activeDateStr, [...reorderedAnytime, ...anchoredTimeline]);
    };

  const DateBadge = ({ date }) => {
      const dateObj = DateUtils.parseYYYYMMDDToDate(date);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      const day = dateObj.getDate();
      const isSelected = selectedDate?.getTime() === dateObj.getTime();

      return (
          <TouchableOpacity 
              style={[styles.dateBadge, isSelected ? styles.dateBadgeSelected : styles.dateBadgeUnselected]} 
              onPress={() => setSelectedDate(dateObj)}
          >
              <Text style={[styles.dateBadgeDayText, isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeTextUnselected]}>{day}</Text>
              <Text style={[styles.dateBadgeDayOfWeekText, isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeDayOfWeekTextUnselected]}>{dayOfWeek}</Text>
          </TouchableOpacity>
      );
  };

  const ListHeader = () => (
    <View>
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

        {unassignedIdeas.length > 0 && (
          <View style={[styles.trayContainer, { zIndex: 100 }]}>
            <Text style={styles.trayTitle}>Voted Ideas (Tap to add to day)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }} contentContainerStyle={{ gap: 10, overflow: 'visible' }}>
              {unassignedIdeas.map(item => (
                <View key={item.id} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={() => {
                            if (activeDateStr) addEventToBucket(activeDateStr, item);
                        }}
                        style={{
                            backgroundColor: 'white',
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            borderRadius: 10,
                            width: moderateScale(140),
                            overflow: 'hidden',
                        }}
                    >
                        <Image 
                            source={item.image || require('@/assets/images/Kyoto.jpg')}
                            style={styles.fillView}
                            contentFit='cover'
                            cachePolicy='memory-disk'
                        />
                        <LinearGradient
                            style={styles.fillView}
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.6)', 'rgba(0,0,0,0.8)']}
                            locations={[0, 0.49, 0.78, 1]}
                        />

                        <BlurView intensity={20} tint="default" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 200, overflow: 'hidden', alignSelf: 'flex-end', padding: 4, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)'}}>
                            <MaterialIcons name={'add'} size={moderateScale(22)} color="white" />
                        </BlurView>
                        
                        <BlurView intensity={20} tint="dark" style={{ padding: 3, paddingHorizontal: 8, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 8, alignSelf: 'flex-start', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)', marginVertical: 8}}>
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{item.category}</Text>
                        </BlurView>

                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'white' }} numberOfLines={1}>{item.title}</Text>
                        
                    </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {flexibleBucket.length > 0 && (
            <View style={{ paddingHorizontal: '5%', marginBottom: 10 }}>
                <Text style={styles.headerSubtitle}>Anytime Today (Flexible)</Text>
            </View>
        )}
    </View>
  );

  // The fixed timeline is rendered in the list footer!
  const ListFooter = () => (
      <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: '5%' }}>
              <View style={styles.timelineContainer}>
                  <View style={[styles.line, { top: moderateScale(10) }]} />
                  <View style={[styles.dot, styles.startDot]} />
              </View>
              <View style={[styles.headerContainer, { paddingBottom: 20 }]}>
                  <Text style={styles.headerDate}>{selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null}</Text>
                  <Text style={styles.headerSubtitle}>{anchoredTimeline.length} Events Scheduled</Text>
              </View>
          </View>
          
          {anchoredTimeline.map((item, index) => (
              <ScheduledEventCard 
                  key={item.id} 
                  item={item} 
                  isLast={index === anchoredTimeline.length - 1} 
                  onSetTime={showTimePicker}
              />
          ))}
      </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ReorderableList
          data={flexibleBucket}
          onReorder={reorderBucket}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnytimeEventCard item={item} onSetTime={showTimePicker} />}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          themeVariant="dark" // Matches your clean white UI
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
    screen: { 
        flex: 1 
    },
    tabBarOuterContainer: { 
        padding: 10, 
        marginBottom: 10 
    },
    tabBarInnerContainer: { 
        width: '100%', 
        alignItems: 'center' 
    },
    dateScrollerContainer: { 
        flex: 1, 
        paddingHorizontal: '5%', 
        marginBottom: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3 
    },
    dateScroller: { 
        backgroundColor: 'white', 
        borderRadius: 20 
    },
    dateScrollerContent: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        gap: 10 
    },
    dateBadge: { 
        width: moderateScale(65), 
        paddingVertical: moderateScale(17), 
        borderRadius: 10, 
        alignItems: 'center', 
        gap: moderateScale(5) 
    },
    dateBadgeSelected: { 
        backgroundColor: Colors.primary 
    },
    dateBadgeUnselected: { 
        backgroundColor: Colors.lightGray 
    },
    dateBadgeDayText: { 
        fontSize: moderateScale(14), 
        fontWeight: 'bold' 
    },
    dateBadgeDayOfWeekText: { 
        fontSize: moderateScale(17), 
        fontWeight: 'bold' 
    },
    dateBadgeTextSelected: { 
        color: 'white' 
    },
    dateBadgeTextUnselected: { 
        color: Colors.textSecondary 
    },
    dateBadgeDayOfWeekTextUnselected: { 
        color: Colors.textSecondaryDark 
    },
    trayContainer: { 
        paddingHorizontal: '5%', 
        marginBottom: 20, 
        zIndex: 10, 
        minHeight: 100 
    },
    trayTitle: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: Colors.textSecondaryDark, 
        textTransform: 'uppercase', 
        marginBottom: 10 
    },
    itemContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: '5%' 
    },
    timelineContainer: { 
        width: 40, 
        alignItems: 'center' 
    },
    line: { 
        width: 2, 
        backgroundColor: '#D3D3D3', 
        position: 'absolute', 
        top: 0, 
        bottom: 0 
    },
    lastLine: { 
        bottom: '50%' 
    },
    dot: { 
        width: 16, 
        height: 16, 
        borderRadius: 8, 
        backgroundColor: '#fff', 
        borderWidth: 2, 
        borderColor: Colors.primary, 
        marginTop: moderateScale(42), 
        zIndex: 1 
    },
    startDot: { 
        backgroundColor: Colors.primary, 
        borderColor: Colors.primary, 
        width: 20, 
        height: 20, 
        borderRadius: 10, 
        marginTop: 10 
    },
    contentContainer: { 
        flex: 1, 
        paddingBottom: 30, 
        paddingLeft: 10 
    },
    card: { 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3 
    },
    timeBadge: { 
        backgroundColor: '#E0E0E0', 
        alignSelf: 'flex-start', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 4, 
        marginBottom: 8 
    },
    timeText: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#555' 
    },
    title: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 4 
    },
    category: { 
        color: '#777', 
        fontSize: 14 
    },
    headerContainer: { 
        marginBottom: 20 
    },
    headerDate: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: '#000', 
        lineHeight: 34 
    },
    headerSubtitle: { 
        fontSize: 16, 
        fontWeight: '500', 
        color: '#000', 
        marginTop: 4 
    },
    setTimeButton: { 
        backgroundColor: Colors.primary, 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 8 
    },
    setTimeText: { 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 12 
    },
    fillView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});