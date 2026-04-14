import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import ReusableTabBar from "@/src/components/reusableTabBar";
import AnytimeEventCard from "@/src/components/trip-info/timeline/anytimeEventCard";
import DateBadge from "@/src/components/trip-info/timeline/dateBadge";
import ScheduledEventCard from "@/src/components/trip-info/timeline/scheduledEventCard";
import { Colors } from "@/src/constants/colors";
import { getCategoryFallback } from "@/src/constants/TripConstants";
import { useTimeline } from "@/src/hooks/useTimeline";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import DateUtils from "@/src/utils/DateUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ReorderableList from 'react-native-reorderable-list';
import { moderateScale } from "react-native-size-matters";

// ==========================================
// 4. MAIN SCREEN
// ==========================================
export default function Timeline() {
    const tripData = useTripDashboard();
    const {
        selectedDate,
        isTimePickerVisible,
        isIdeaBankVisible,
        selectedEventDetails,
        isEditingEvent,
        eventEditForm,
        dateList,
        flexibleBucket,
        anchoredTimeline,
        unassignedIdeas,
        setSelectedDate,
        setIdeaBankVisible,
        setIsEditingEvent,
        setEventEditForm,
        showTimePicker,
        hideTimePicker,
        handleConfirmTime,
        handleViewDetails,
        handleCloseDetails,
        handleSaveEventDetails,
        handleRemoveEvent,
        handleDeleteEvent,
        reorderBucket,
        handleAddEventToBucket,
    } = useTimeline();

    const listHeader = (
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
                    {dateList.map(d => {
                        const dateObj = DateUtils.parseYYYYMMDDToDate(d);
                        const isSelected = selectedDate?.getTime() === dateObj.getTime();
                        return (
                            <DateBadge 
                                key={d} 
                                dateStr={d} 
                                isSelected={isSelected} 
                                onPress={setSelectedDate} 
                            />
                        );
                    })}
                </ScrollView>
            </View>

            {flexibleBucket.length > 0 && (
                <View style={{ paddingHorizontal: '5%', marginBottom: 10, marginTop: 10 }}>
                    <Text style={styles.headerSubtitle}>Anytime Today (Flexible)</Text>
                </View>
            )}
        </View>
    );

    const listFooter = (
        <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: '5%' }}>
                <View style={styles.timelineContainer}>
                    <View style={[styles.line, { top: moderateScale(10) }]} />
                    <View style={[styles.dot, styles.startDot]} />
                </View>
                <View style={[styles.headerContainer, { paddingBottom: 20 }]}>
                    <Text style={styles.headerDate}>
                        {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
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
                    onViewDetails={handleViewDetails}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.screen}>
            <ReorderableList
                data={flexibleBucket} 
                onReorder={reorderBucket}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AnytimeEventCard item={item} onSetTime={showTimePicker} onRemove={handleRemoveEvent} />}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                contentContainerStyle={{ paddingBottom: 150 }} 
            />

            {unassignedIdeas.length > 0 && (
                <TouchableOpacity style={styles.floatingBankButton} onPress={() => setIdeaBankVisible(true)}>
                    <MaterialIcons name="inventory-2" size={20} color="white" />
                    <Text style={styles.floatingBankText}>{unassignedIdeas.length} Ready to Schedule</Text>
                </TouchableOpacity>
            )}

            {/* --- IDEA BANK BOTTOM SHEET --- */}
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
                                    {item.image_url ? (
                                        <Image source={item.image_url} style={styles.fullImage} contentFit="cover" />
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
                                    onPress={() => {
                                        handleAddEventToBucket(item);
                                    }}
                                >
                                    <MaterialIcons name="add" size={22} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ScrollView>
            </AnimatedBottomSheet>

            <AnimatedBottomSheet visible={!!selectedEventDetails} onClose={handleCloseDetails}>
                {selectedEventDetails && (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, keyboardShouldPersistTaps: 'handled' }}>
                        
                        {/* Header Image */}
                        <View style={styles.detailsImageContainer}>
                            {selectedEventDetails.image_url ? (
                                <Image source={selectedEventDetails.image_url} style={styles.fullImage} contentFit="cover" />
                            ) : (
                                <LinearGradient colors={getCategoryFallback(selectedEventDetails.category).colors} style={styles.fallbackGradient}>
                                    <MaterialIcons name={getCategoryFallback(selectedEventDetails.category).icon} size={60} color="rgba(255,255,255,0.9)" />
                                </LinearGradient>
                            )}
                            <TouchableOpacity onPress={handleCloseDetails} style={styles.detailsCloseBtn}>
                                <MaterialIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.detailsContent}>
                            
                            {/* Header Row & Edit Button */}
                            <View style={styles.detailsHeaderRow}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    {isEditingEvent ? (
                                        <TextInput 
                                            style={[styles.detailsTitle, styles.activeInput]} 
                                            value={eventEditForm.title}
                                            onChangeText={(text) => setEventEditForm(prev => ({...prev, title: text}))}
                                            placeholder="Event Title"
                                        />
                                    ) : (
                                        <Text style={styles.detailsTitle}>{selectedEventDetails.title}</Text>
                                    )}
                                    <Text style={styles.detailsCategory}>{selectedEventDetails.category}</Text>
                                </View>

                                {/* Edit / Save Button Toggle */}
                                {isEditingEvent ? (
                                    <TouchableOpacity onPress={handleSaveEventDetails} style={styles.saveButton}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => setIsEditingEvent(true)} style={styles.editButton}>
                                        <MaterialIcons name="edit" size={20} color={Colors.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Time Row */}
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                                {selectedEventDetails.time && selectedEventDetails.time !== 'TBD' && selectedEventDetails.time !== 'All Day' && (
                                    <View style={styles.detailsTimeBadge}>
                                        <Text style={styles.detailsTimeText}>{selectedEventDetails.time}</Text>
                                    </View>
                                )}
                            </View>

                            {/* DESCRIPTION */}
                            <View style={styles.detailsSection}>
                                <Text style={styles.detailsSectionLabel}>DESCRIPTION</Text>
                                {isEditingEvent ? (
                                    <TextInput 
                                        style={[styles.detailsDescription, styles.activeInput, { minHeight: 80 }]}
                                        value={eventEditForm.description}
                                        onChangeText={(text) => setEventEditForm(prev => ({...prev, description: text}))}
                                        placeholder="What are the details?"
                                        placeholderTextColor="#94a3b8"
                                        multiline
                                        textAlignVertical="top"
                                    />
                                ) : (
                                    <Text style={[styles.detailsDescription, !selectedEventDetails.description && styles.emptyText]}>
                                        {selectedEventDetails.description || "Add a description for this event..."}
                                    </Text>
                                )}
                            </View>

                            {/* LOCATION */}
                            <View style={styles.detailsSection}>
                                <Text style={styles.detailsSectionLabel}>LOCATION</Text>
                                <View style={[styles.actionRow, isEditingEvent && styles.activeInputRow]}>
                                    <View style={styles.actionIconCircle}>
                                        <MaterialIcons name="place" size={20} color="#64748b" />
                                    </View>
                                    {isEditingEvent ? (
                                        <TextInput 
                                            style={styles.rowTextInput}
                                            value={eventEditForm.address}
                                            onChangeText={(text) => setEventEditForm(prev => ({...prev, address: text}))}
                                            placeholder="Where is it?"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    ) : (
                                        <Text style={[styles.actionRowText, !selectedEventDetails.address && styles.emptyText]}>
                                            {selectedEventDetails.address || 'Add an address...'}
                                        </Text>
                                    )}
                                </View>
                            </View>

                        </View>
                    </ScrollView>
                )}
            </AnimatedBottomSheet>

            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={hideTimePicker}
                themeVariant="dark" 
            />
        </View>
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
    cardImageContainer: { width: 80, height: '100%', borderRadius: 10, backgroundColor: Colors.lightGray, overflow: 'hidden' },
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
    
    // --- BUTTONS ---
    setTimeButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    setTimeText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
    removeButton: { padding: 4, backgroundColor: '#f8fafc', borderRadius: 12 },
    floatingBankButton: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8, gap: 8 },
    floatingBankText: { color: 'white', fontWeight: '700', fontSize: 14 },
    
    // --- BOTTOM SHEET & DETAILS ---
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    sheetSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },
    closeButton: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 },
    bankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    bankItemImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f1f5f9', overflow: 'hidden' },
    bankItemInfo: { flex: 1, paddingHorizontal: 14 },
    bankItemTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    bankItemCategory: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    bankAddButton: { backgroundColor: '#0f172a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

    detailsImageContainer: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: 20 },
    detailsCloseBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 20 },
    detailsContent: { paddingHorizontal: 10 },
    detailsTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
    detailsCategory: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
    detailsTimeBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    detailsTimeText: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    detailsSection: { marginTop: 24 },
    detailsSectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 8 },
    detailsDescription: { fontSize: 16, color: '#334155', lineHeight: 24 },

    detailsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    editButton: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 },
    saveButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    saveButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
    
    actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    actionIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    actionRowText: { flex: 1, fontSize: 15, color: '#334155', fontWeight: '500' },
    rowTextInput: { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '500', padding: 0 },
    
    emptyText: { color: '#94a3b8', fontStyle: 'italic', fontWeight: '400' },
    activeInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 },
    activeInputRow: { backgroundColor: '#ffffff', borderColor: Colors.primary },
});