import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import DeckSwiper from "@/src/components/DeckSwiper";
import ProgressBar from "@/src/components/progressBar";
import ReusableTabBar from "@/src/components/reusableTabBar";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { getCategoryFallback } from "@/src/constants/eventCategoryStyles";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// ==========================================
// 1. CARDS & COMPONENTS
// ==========================================

const VotingInProgressCard = ({ item, group }) => {
  const currentVotes = item.event_votes || [];
  const yesVotes = currentVotes.reduce((sum, vote) => sum + (vote.vote_value === 1 ? 1 : 0), 0);  
  
  // FIX: Calculate required votes so the progress bar accurately hits 100%
  const activeGroupSize = group.length;
  const requiredVotes = Math.floor(activeGroupSize / 2) + 1;
  const fallback = getCategoryFallback(item.category);
  
  // Cap at 100% just in case
  const progressPercentage = requiredVotes > 0 ? `${Math.min((yesVotes / requiredVotes) * 100, 100)}%` : '0%';

  return (
    <View style={styles.votingCardContainer}>
      {item.image_url ? (
        <Image 
          source={item.image_url} 
          style={styles.votingCardImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ):(
        <LinearGradient colors={fallback.colors} style={[ styles.votingCardImage, { alignItems: 'center', justifyContent: 'center' } ]}>
          <MaterialIcons name={fallback.icon} size={24} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      )}
      
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.category} • $$</Text>
        <View style={{ marginTop: moderateScale(8) }}>
          <ProgressBar 
            width={'100%'} 
            height={moderateScale(6)} 
            progress={progressPercentage} 
            progressColor={Colors.success} 
          />
          <View style={styles.progressTextRow}>
            {/* FIX: Show progress out of Required Votes, not total group size */}
            <Text style={styles.progressText}>{yesVotes}/{requiredVotes} Needed</Text>
            <Text style={styles.progressText}>Waiting on group</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const DiscoverCard = ({ item, swipeLeft, swipeRight }) => {
  const fallback = getCategoryFallback(item.category);

  return (
    <View style={styles.discoverCardContainer}>
      <View style={styles.discoverCardContent}>
        {item.image_url ? (
          <Image 
            source={item.image_url} 
            style={styles.discoverCardImage}
            contentFit="cover" 
            transition={200} 
            cachePolicy="memory-disk" 
          />
        ) : (
          <LinearGradient colors={fallback.colors} style={styles.fallbackGradient}>
            <MaterialIcons name={fallback.icon} size={80} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        )}
        
        <View style={styles.discoverCardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.description}</Text>
          
          <View style={styles.swipeActionRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.danger }]} onPress={swipeLeft} hitSlop={5}>
              <MaterialIcons name="close" size={moderateScale(20)} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.success }]} onPress={swipeRight} hitSlop={5}>
              <MaterialIcons name="check" size={moderateScale(20)} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// ==========================================
// 2. MAIN SCREEN
// ==========================================

export default function IdeaBoard() {
  const { discoverFeed, inProgressFeed, handleVote, group, refreshTripData, tripId, addCustomIdea } = useTrip();

  const [swiperData, setSwiperData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', category: 'Food', description: '', imageUri: null });

  const renderDiscoverCard = useCallback(({ item, index, swipeLeft, swipeRight }) => {
    return <DiscoverCard item={item} swipeLeft={swipeLeft} swipeRight={swipeRight} />;
  }, []);

  const onRefresh = useCallback(async () => {
    await refreshTripData();
  }, [refreshTripData]);

  // FIX: Smarter sync logic for swiperData
  useEffect(() => {
    setSwiperData(prevSwiperData => {
        // If the swiper is currently empty, just load everything.
        if (prevSwiperData.length === 0) return discoverFeed;

        // Find items in the new discoverFeed that aren't currently in our swiper deck
        const existingIds = new Set(prevSwiperData.map(item => item.id));
        const newItems = discoverFeed.filter(item => !existingIds.has(item.id));
        
        if (newItems.length > 0) {
            // Append new real-time ideas to the back of the deck!
            return [...prevSwiperData, ...newItems]; 
        }
        return prevSwiperData;
    });
  }, [discoverFeed]);

  const handleAddPhoto = async () => {
    const uri = await MediaUtils.pickImage();
    if (uri) {
      setNewIdea(prev => ({ ...prev, imageUri: uri }));
    }
  };

  const handleSaveIdea = async () => {
    await addCustomIdea(newIdea); 
    setModalVisible(false);
    setNewIdea({ title: '', category: 'Food', description: '', imageUri: null });
  };

  // FIX: Wrap everything in a root View
  return (
    <View style={styles.container}>
      {/* 1. SCROLLVIEW SIBLING */}
      <TripInfoScrollView onRefresh={onRefresh} style={{ flex: 1 }}>
        <View style={styles.tabBarWrapper}>
          <ReusableTabBar 
            tabs={[
              { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripId}/(plan)/idea-board` },
              { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripId}/(plan)/timeline` },
              { label: "Map", name: "map", route: `/(trip-info)/${tripId}/(plan)/map` },
              { label: "Stays", name: "stays", route: `/(trip-info)/${tripId}/(plan)/stays` },
            ]}
          />
        </View>

        <View style={styles.scrollContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover New Ideas</Text>
            <TouchableOpacity style={styles.addIdeaButton} onPress={() => setModalVisible(true)}>
              <MaterialIcons name="add" size={moderateScale(16)} color={Colors.primary} />
              <Text style={styles.addIdeaText}>Add Idea</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.swiperWrapper}>
            {swiperData.length > 0 ? (
              <DeckSwiper 
                data={swiperData}
                renderItem={renderDiscoverCard}
                onSwipeLeft={(item) => handleVote(item.id, 'no')}
                onSwipeRight={(item) => handleVote(item.id, 'yes')}
              />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.emptyText}>No new ideas right now. Check back later!</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Voting In Progress</Text>
          <View style={styles.votingListContainer}>
              {inProgressFeed.length === 0 ? (
                <Text style={styles.emptyText}>Swipe right on some ideas to start voting!</Text>
              ) : (
                inProgressFeed.map((item, index) => (
                  <VotingInProgressCard key={item.id || index} item={item} group={group} />
                ))
              )}
          </View>
        </View>
      </TripInfoScrollView>

      {/* 2. BOTTOM SHEET SIBLING (Outside the ScrollView!) */}
      <AnimatedBottomSheet visible={isModalVisible} onClose={() => setModalVisible(false)}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add to Trip</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.premiumTitleInput} 
            placeholder="Name of place or activity..." 
            placeholderTextColor="#94a3b8"
            value={newIdea.title}
            onChangeText={(text) => setNewIdea({...newIdea, title: text})}
          />

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
                {['Food', 'Activity', 'Nightlife', 'Lodging', 'Other'].map((cat) => {
                  const isSelected = newIdea.category === cat;
                  return (
                      <TouchableOpacity 
                      key={cat}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setNewIdea({...newIdea, category: cat})}
                      >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>DETAILS (OPTIONAL)</Text>
            
              <TouchableOpacity style={styles.photoUploadRow} onPress={handleAddPhoto}>
                  <View style={styles.photoIconCircle}>
                    <MaterialIcons name={newIdea.imageUri ? "check" : "add-a-photo"} size={18} color="#0f172a" />
                  </View>
                  <Text style={styles.photoUploadText}>
                    {newIdea.imageUri ? 'Photo selected' : 'Attach a photo'}
                  </Text>
              </TouchableOpacity>

              <TextInput 
                style={styles.premiumNotesInput} 
                placeholder="Add a link, address, or reason why..." 
                placeholderTextColor="#94a3b8"
                value={newIdea.description}
                onChangeText={(text) => setNewIdea({...newIdea, description: text})}
                multiline
              />
            </View>

            <TouchableOpacity 
              style={[styles.premiumSubmitButton, !newIdea.title && styles.premiumSubmitDisabled]} 
              disabled={!newIdea.title}
              onPress={handleSaveIdea}
            >
            <Text style={styles.premiumSubmitText}>Save Idea</Text>
          </TouchableOpacity>
      </AnimatedBottomSheet>
    </View>
  );
}

// ==========================================
// 3. STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBarWrapper: { padding: 10, alignItems: 'center' },
  scrollContent: { padding: '5%' },
  
  // --- TYPOGRAPHY & HEADERS ---
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(10), marginTop: moderateScale(10) },
  emptyText: { color: Colors.gray, marginBottom: moderateScale(20), fontStyle: 'italic' },
  
  addIdeaButton: { flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  addIdeaText: { fontSize: moderateScale(12), color: Colors.primary, fontWeight: '600' },
  
  // --- DISCOVER CARD ---
  swiperWrapper: { minHeight: 360, justifyContent: 'center', width: '100%' },
  discoverCardContainer: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: moderateScale(20), width: '100%', backgroundColor: 'white', borderRadius: 20 },
  discoverCardContent: { borderRadius: 20, overflow: 'hidden', width: '100%', backgroundColor: 'white' },
  discoverCardImage: { width: '100%', height: 180 },
  fallbackGradient: { width: '100%', height: 180, alignItems: 'center', justifyContent: 'center' },
  discoverCardInfo: { padding: 15, justifyContent: 'center' },
  swipeActionRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: moderateScale(10) },
  actionButton: { padding: 12, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  
  // --- VOTING CARD ---
  votingListContainer: { gap: 15, marginBottom: moderateScale(20) },
  votingCardContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', borderRadius: 15, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  votingCardImage: { width: 75, height: 75, borderRadius: 10 },
  cardTitle: { fontSize: moderateScale(16), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(2) },
  cardSubtitle: { fontSize: moderateScale(13), color: Colors.gray },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressText: { fontSize: moderateScale(11), color: Colors.gray, fontWeight: '600' },

  // --- BOTTOM SHEET FORM ---
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  closeButton: { backgroundColor: '#f1f5f9', padding: 6, borderRadius: 16 },
  
  premiumTitleInput: { fontSize: 26, fontWeight: '700', color: '#0f172a', marginBottom: 30 },
  inputSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 12 },
  
  // Category Pills
  pillContainer: { gap: 8, flexDirection: 'row' },
  pill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', marginRight: 8 },
  pillActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  pillTextActive: { color: '#ffffff' },
  
  // Photo Row
  photoUploadRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 12 },
  photoIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  photoUploadText: { fontSize: 15, fontWeight: '500', color: '#0f172a' },
  
  // Notes & Submit
  premiumNotesInput: { fontSize: 15, color: '#0f172a', lineHeight: 22, paddingTop: 12, minHeight: 60 },
  premiumSubmitButton: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  premiumSubmitDisabled: { backgroundColor: '#cbd5e1' },
  premiumSubmitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});