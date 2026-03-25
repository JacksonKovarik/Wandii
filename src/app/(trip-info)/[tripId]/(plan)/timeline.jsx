import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import ReusableTabBar from "@/src/components/reusableTabBar";
import { Colors } from "@/src/constants/colors";
import { getCategoryFallback } from "@/src/constants/eventCategoryStyles"; // <-- NEW IMPORT
import DateUtils from "@/src/utils/DateUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ReorderableList, { reorderItems, useIsActive, useReorderableDrag } from 'react-native-reorderable-list';
import { moderateScale } from "react-native-size-matters";

const AnytimeEventCard = ({ item, onSetTime, onRemove }) => {
    const drag = useReorderableDrag();
    const isActive = useIsActive();
    const fallback = getCategoryFallback(item.category);

    return (
        <Pressable 
            onLongPress={drag}
            delayLongPress={150}
            style={[styles.itemContainer, isActive && { opacity: 0.7, transform: [{ scale: 1.02 }] }]}
        >
            <View style={[styles.contentContainer, { paddingLeft: 0, width: '100%' }]}>
                <View style={[styles.card, isActive && styles.cardActive]}>    
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardMainInfo}>
                            <View style={[styles.cardImageContainer, styles.anytimeCardImageContainer]}>
                                {item.image ? (
                                    <Image source={item.image} style={styles.fullImage} contentFit="cover" />
                                ) : (
                                    <LinearGradient colors={fallback.colors} style={styles.fallbackGradient}>
                                        <MaterialIcons name={fallback.icon} size={24} color="rgba(255,255,255,0.9)" />
                                    </LinearGradient>
                                )}
                            </View>
                            <View style={styles.cardTextContent}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.cardActions}>
                            <TouchableOpacity style={styles.setTimeButton} onPress={() => onSetTime(item.id)}>
                                <Text style={styles.setTimeText}>Set Time</Text>
                            </TouchableOpacity>
                            {/* NEW: Remove Event Button */}
                            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item)}>
                                <MaterialIcons name="close" size={16} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const ScheduledEventCard = ({ item, isLast, onSetTime, onRemove, onDelete }) => {
    // --- State for delayed press effect ---
    const [isVisuallyPressed, setVisuallyPressed] = useState(false);
    const pressInTimer = useRef(null);
    const PRESS_DELAY = 200; // 100ms delay before showing visual feedback

    const handleLongPress = () => {
        Alert.alert(
            "Manage Event",
            `What would you like to do with "${item.title}"?`,
            [
                { 
                    text: "Cancel", 
                    style: "cancel" 
                },
                { 
                    text: "Unassign (Back to Bank)", 
                    onPress: () => onRemove(item) 
                },
                { 
                    text: "Delete Permanently", 
                    style: "destructive", // Makes the text red on iOS!
                    onPress: () => onDelete(item) 
                }
            ],
            { cancelable: true } // Allows tapping outside to close on Android
        );
    };

    const handlePressIn = () => {
        pressInTimer.current = setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setVisuallyPressed(true);
        }, PRESS_DELAY);
    };

    const handlePressOut = () => {
        // Clear timer if the press is shorter than the delay
        clearTimeout(pressInTimer.current);
        setVisuallyPressed(false);
    };

    return (
        <View style={styles.itemContainer}>
            <View style={styles.timelineContainer}>
                <View style={[styles.line, isLast && styles.lastLine]} />
                <View style={[styles.dot]} />
            </View>

            <View style={styles.contentContainer}>
                <Pressable 
                    onLongPress={handleLongPress}
                    delayLongPress={250} // Wait 250ms before triggering
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.contentContainer, 
                        // Apply visual feedback based on our delayed state
                        isVisuallyPressed && { opacity: 0.8, transform: [{ scale: 1.03 }] }
                    ]}
                >
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardTextContent}>
                                <TouchableOpacity style={styles.timeBadge} onPress={() => onSetTime(item.id)}>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </TouchableOpacity>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                            
                            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                <View style={styles.cardImageContainer}>
                                    {item.image && <Image source={item.image} style={styles.fullImage} contentFit="cover" />}
                                </View>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

export default function Timeline() {
    const tripData = useTrip();
    const { timelineData = {}, addEventToBucket, updateDayEvents, unassignedIdeas = [] } = tripData;

    const [selectedDate, setSelectedDate] = useState(null);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isIdeaBankVisible, setIdeaBankVisible] = useState(false); 

    const activeDateStr = selectedDate ? DateUtils.formatDateToYYYYMMDD(selectedDate) : null;

    useEffect(() => {
        // TODO: Default to the trip's actual start date instead of hardcoded date
        setInitialSelectedDate("2023-10-12");
    }, []);

    const setInitialSelectedDate = (dateStr) => {
        setSelectedDate(DateUtils.parseYYYYMMDDToDate(dateStr));
    };

    const showTimePicker = (itemId) => {
        setSelectedItemId(itemId);
        setTimePickerVisibility(true);
    };

    const handleConfirmTime = (date) => {
        if (!selectedItemId || !activeDateStr) return;

        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; 
        const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ampm}`;

        const updatedDayData = currentDayData.map(item => 
            item.id === selectedItemId ? { ...item, time: formattedTime } : item
        );

        updateDayEvents(activeDateStr, updatedDayData);
        setTimePickerVisibility(false);
        setSelectedItemId(null);
    };

    const handleRemoveEvent = (item) => {
        if (!activeDateStr) return;
        // 1. Remove from current day's timeline
        const updatedDayData = currentDayData.filter(e => e.id !== item.id);
        updateDayEvents(activeDateStr, updatedDayData);
        // 2. TODO: Call a Context function here to mark item as 'approved' so it returns to the Bank
        // e.g., tripData.unassignEvent(item.id); 
    };

    const handleDeleteEvent = (item) => {
        // NEW: Removes from timeline, and DOES NOT send back to bank
        if (!activeDateStr) return;
        const updatedDayData = currentDayData.filter(e => e.id !== item.id);
        updateDayEvents(activeDateStr, updatedDayData);
        // TODO: Context function to permanently delete from database
    };

  const parseTimeToMinutes = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
  };

    const currentDayData = activeDateStr ? (timelineData[activeDateStr] || []) : [];
    const flexibleBucket = currentDayData.filter(e => !e.time || e.time === 'TBD' || e.time === 'All Day');
    const anchoredTimeline = currentDayData
        .filter(e => e.time && e.time !== 'TBD' && e.time !== 'All Day')
        .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    const reorderBucket = ({ from, to }) => {
        if (!activeDateStr) return;
        const reorderedAnytime = reorderItems(flexibleBucket, from, to);
        updateDayEvents(activeDateStr, [...reorderedAnytime, ...anchoredTimeline]);
    };
    
    const DateBadge = ({ date }) => {
        const dateObj = DateUtils.parseYYYYMMDDToDate(date);
        const isSelected = selectedDate?.getTime() === dateObj.getTime();

        return (
            <TouchableOpacity 
                style={[styles.dateBadge, isSelected ? styles.dateBadgeSelected : styles.dateBadgeUnselected]} 
                onPress={() => setSelectedDate(dateObj)}
            >
                <Text style={[styles.dateBadgeDayText, isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeTextUnselected]}>
                    {dateObj.getDate()}
                </Text>
                <Text style={[styles.dateBadgeDayOfWeekText, isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeDayOfWeekTextUnselected]}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                </Text>
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
                    {/* TODO: Dynamically render dates based on tripData.startDate and tripData.endDate */}
                    {["2023-10-12", "2023-10-13", "2023-10-14", "2023-10-15", "2023-10-16"].map(d => (
                        <DateBadge key={d} date={d} />
                    ))}
                </ScrollView>
            </View>

            {flexibleBucket.length > 0 && (
                <View style={{ paddingHorizontal: '5%', marginBottom: 10, marginTop: 10 }}>
                    <Text style={styles.headerSubtitle}>Anytime Today (Flexible)</Text>
                </View>
            )}
        </View>
    );

    const ListFooter = () => (
        <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: '5%' }}>
                <View style={styles.timelineContainer}>
                    <View style={[styles.line, { top: moderateScale(10) }]} />
                    <View style={[styles.dot, styles.startDot]} />
                </View>
                <View style={[styles.headerContainer, { paddingBottom: 20 }]}>
                    <Text style={styles.headerDate}>
                        {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={styles.headerSubtitle}>{anchoredTimeline.length} Events Scheduled</Text>
                </View>
            </View>
            
            {anchoredTimeline.map((item, index) => (
                <ScheduledEventCard 
                    key={item.id} 
                    item={item} 
                    isLast={index === anchoredTimeline.length - 1} 
                    onSetTime={showTimePicker}
                    onRemove={handleRemoveEvent}
                    onDelete={handleDeleteEvent}
                />
            ))}
        </View>
    );

    return (
        <GestureHandlerRootView style={styles.screen}>
        <View style={styles.screen}>
            <ReorderableList
            data={flexibleBucket}
            onReorder={reorderBucket}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AnytimeEventCard item={item} onSetTime={showTimePicker} onRemove={handleRemoveEvent} />}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            contentContainerStyle={{ paddingBottom: 150 }} 
            />

            {unassignedIdeas.length > 0 && (
            <TouchableOpacity style={styles.floatingBankButton} onPress={() => setIdeaBankVisible(true)}>
                <MaterialIcons name="inventory-2" size={20} color="white" />
                <Text style={styles.floatingBankText}>{unassignedIdeas.length} Ready to Schedule</Text>
            </TouchableOpacity>
            )}

            <AnimatedBottomSheet visible={isIdeaBankVisible} onClose={() => setIdeaBankVisible(false)}>
                <View style={styles.sheetHeader}>
                <View>
                    <Text style={styles.sheetTitle}>Itinerary Bank</Text>
                    <Text style={styles.sheetSubtitle}>Ideas ready to be scheduled</Text>
                </View>
                <TouchableOpacity onPress={() => setIdeaBankVisible(false)} style={styles.closeButton}>
                    <MaterialIcons name="close" size={22} color="#0f172a" />
                </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {unassignedIdeas.map(item => {
                    const fallback = getCategoryFallback(item.category);
                    const isCustom = item.description === 'Custom Idea'; 

                    return (
                    <View key={item.id} style={styles.bankItem}>
                        <View style={styles.bankItemImage}>
                            {item.image ? (
                                <Image source={item.image} style={styles.fullImage} contentFit="cover" />
                            ) : (
                                <LinearGradient colors={fallback.colors} style={styles.fallbackGradient}>
                                    <MaterialIcons name={fallback.icon} size={24} color="rgba(255,255,255,0.9)" />
                                </LinearGradient>
                            )}
                        </View>
                        
                        <View style={styles.bankItemInfo}>
                            <Text style={styles.bankItemTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.bankItemCategory}>
                                {item.category} • {isCustom ? 'Added by You' : 'Group Approved'}
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.bankAddButton}
                            onPress={() => activeDateStr && addEventToBucket(activeDateStr, item)}
                        >
                            <MaterialIcons name="add" size={22} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    );
                })}
                </ScrollView>
            </AnimatedBottomSheet>

            <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleConfirmTime}
            onCancel={() => setTimePickerVisibility(false)}
            themeVariant="dark" 
            />
        </View>
        </GestureHandlerRootView>
    );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
    screen: { flex: 1 },
    tabBarOuterContainer: { padding: 10, marginBottom: 10 },
    tabBarInnerContainer: { width: '100%', alignItems: 'center' },
    
    // --- LAYOUT & TIMELINE ---
    itemContainer: { flexDirection: 'row', paddingHorizontal: '5%', marginBottom: 10 },
    contentContainer: { flex: 1, paddingLeft: 10 },
    timelineContainer: { width: 30, alignItems: 'center' },
    line: { width: 2, backgroundColor: '#D3D3D3', position: 'absolute', top: 0, bottom: -10 },
    lastLine: { bottom: '50%' },
    dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary, marginTop: moderateScale(42), zIndex: 1 },
    startDot: { backgroundColor: Colors.primary, borderColor: Colors.primary, width: 20, height: 20, borderRadius: 10, marginTop: 10 },
    
    // --- CARDS ---
    card: { backgroundColor: 'white', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    cardActive: { shadowOpacity: 0.3, elevation: 8, borderColor: Colors.primary, borderWidth: 1 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cardMainInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    cardTextContent: { flex: 1, paddingRight: 10 },
    cardImageContainer: { width: 80, height: 80, borderRadius: 10, backgroundColor: Colors.lightGray, overflow: 'hidden' },
    anytimeCardImageContainer: { width: 65, height: 65, marginRight: 12 },
    cardActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
    
    fullImage: { width: '100%', height: '100%' },
    fallbackGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    
    // --- TYPOGRAPHY & BADGES ---
    timeBadge: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 10 },
    timeText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
    title: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    category: { color: '#64748b', fontSize: 13, fontWeight: '500' },
    headerContainer: { marginBottom: 20 },
    headerDate: { fontSize: 24, fontWeight: '800', color: '#0f172a', lineHeight: 30 },
    headerSubtitle: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    
    // --- SCROLLER ---
    dateScrollerContainer: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 15 },
    dateScrollerContent: { paddingHorizontal: '5%', gap: 10 },
    dateBadge: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1 },
    dateBadgeSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    dateBadgeUnselected: { backgroundColor: 'white', borderColor: '#e2e8f0' },
    dateBadgeDayText: { fontSize: 20, fontWeight: '800' },
    dateBadgeDayOfWeekText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    dateBadgeTextSelected: { color: 'white' },
    dateBadgeTextUnselected: { color: '#0f172a' },
    dateBadgeDayOfWeekTextUnselected: { color: '#64748b' },
    
    // --- BUTTONS ---
    setTimeButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    setTimeText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
    removeButton: { padding: 4, backgroundColor: '#f8fafc', borderRadius: 12 },
    floatingBankButton: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8, gap: 8 },
    floatingBankText: { color: 'white', fontWeight: '700', fontSize: 14 },
    
    // --- BOTTOM SHEET ---
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    sheetSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },
    closeButton: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 },
    bankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    bankItemImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f1f5f9', overflow: 'hidden' },
    bankItemInfo: { flex: 1, paddingHorizontal: 14 },
    bankItemTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    bankItemCategory: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    bankAddButton: { backgroundColor: '#0f172a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }
});