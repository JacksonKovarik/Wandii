import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { File } from 'expo-file-system'; // 1. IMPORTING THE NEW API
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, LayoutAnimation, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// IMPORT SUPABASE
import { supabase } from "@/src/lib/supabase";

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85;
const cardSpacing = (screenWidth - cardWidth) / 2;

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

const JournalCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const authorName = item.author || "Maria K."; 
  const authorAvatar = item.avatar || 'https://i.pravatar.cc/150?u=maria';
  const entryImages = item.images || []; 

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.journalCardContentFirst}>
      <TouchableOpacity activeOpacity={0.8} onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={styles.authorRow}>
              <Image source={{ uri: authorAvatar }} style={styles.authorAvatar} />
              <View>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.dateTimeText}>{item.date || "Unknown Date"}</Text> 
              </View>
          </View>
          <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={24} color={Colors.textSecondary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.entryTitleContentFirst} numberOfLines={isExpanded ? undefined : 1}>
            {item.title}
          </Text>
          <Text style={styles.entryDescriptionContentFirst} numberOfLines={isExpanded ? undefined : 2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {entryImages.length > 0 && (
        <View style={styles.imageStripWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageStripContainer}>
            {entryImages.map((imgUri, index) => (
              <Image 
                key={index}
                source={{ uri: imgUri }} 
                style={styles.stripImage} 
                contentFit="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ==========================================
// 2. MAIN SCREEN
// ==========================================

export default function Memories() {
  const { tripId } = useTrip();
  
  // --- STATE ---
  const [memories, setMemories] = useState([]);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [entryImages, setEntryImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalPhotoCount, setTotalPhotoCount] = useState(0);
  
  const CURRENT_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad';

  // --- FETCH DATA LOGIC ---
  const fetchMemoriesData = async () => {
    if (!tripId) return;

    try {
      setIsLoading(true);

      const [memoriesResponse, albumResponse, countResponse] = await Promise.all([
        supabase.functions.invoke('get-trip-memories', { body: { tripId } }),
        supabase.functions.invoke('get-trip-album', { body: { tripId, limit: 5 } }),
        supabase.from('Photos').select('*', { count: 'exact', head: true }).eq('trip_id', tripId)
      ]);

      if (memoriesResponse.error) console.error("Memories Fetch Error:", memoriesResponse.error);
      else setMemories(memoriesResponse.data || []);

      if (albumResponse.error) console.error("Album Fetch Error:", albumResponse.error);
      else setAlbumPhotos(albumResponse.data || []);

      if (countResponse.count !== null) setTotalPhotoCount(countResponse.count);

    } catch (err) {
      console.error("Unexpected error fetching memories/album:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoriesData();
  }, [tripId]);

  const handleRefresh = async () => {
    await fetchMemoriesData();
  };

  // --- ☁️ UPLOAD HELPER (New Expo SDK 54 API) ---
  const uploadImageToSupabase = async (uri) => {
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${tripId}/${fileName}`; 

    // 2. USE THE NATIVE FILE CLASS
    const file = new File(uri);
    const arrayBuffer = await file.arrayBuffer();

    // 3. UPLOAD RAW BYTES
    const { error } = await supabase.storage
      .from('trip-media') 
      .upload(filePath, arrayBuffer, {
        contentType: file.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
      });
      
    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('trip-media')
      .getPublicUrl(filePath);
      
    return publicUrlData.publicUrl;
  };

  // --- 📷 STANDALONE SHARED ALBUM UPLOAD ---
  const handleUploadSharedPhoto = async () => {
    const uri = await MediaUtils.pickImage();
    if (!uri) return;

    try {
      setIsLoading(true); 
      const publicUrl = await uploadImageToSupabase(uri);

      const { data: dbData, error: dbError } = await supabase
        .from('Photos')
        .insert({
          trip_id: tripId,
          uploader_id: CURRENT_USER_ID,
          photo_url: publicUrl,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update UI instantly
      setAlbumPhotos(prevPhotos => [
        { id: dbData.photo_id, uri: dbData.photo_url, mock: false }, 
        ...prevPhotos
      ]);
    } catch (err) {
      console.error("Shared Photo Upload Error:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 📝 SAVE JOURNAL ENTRY (High-Speed Parallel) ---
  const handleAddEntryImage = async () => {
    const uri = await MediaUtils.pickImage();
    if (uri) setEntryImages(prev => [...prev, uri]);
  };

  const handleSaveEntry = async () => {
    if (!entryTitle.trim() || isUploading) return; 
    setIsUploading(true);

    try {
      const { data: newJournal, error: journalError } = await supabase
        .from('Journals') 
        .insert({ 
          trip_id: tripId, 
          title: entryTitle, 
          description: entryDescription, 
          created_by: CURRENT_USER_ID 
        })
        .select()
        .single();

      if (journalError) throw journalError;

      if (entryImages.length > 0) {
        const uploadPromises = entryImages.map(async (uri) => {
          const publicUrl = await uploadImageToSupabase(uri);
          
          return supabase.from('Photos').insert({
            photo_url: publicUrl, 
            uploader_id: CURRENT_USER_ID, 
            trip_id: tripId, 
            entry_id: newJournal.entry_id
          });
        });

        await Promise.all(uploadPromises); 
      }

      setEntryTitle("");
      setEntryDescription("");
      setEntryImages([]);
      setIsModalVisible(false);
      
      fetchMemoriesData(); 

    } catch (error) {
      console.error("Save Entry Error:", error);
      alert("Failed to save journal entry. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
  }

  return (
    <TripInfoScrollView onRefresh={handleRefresh} style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* --- TRIP JOURNAL SECTION --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trip Journal</Text>
        <TouchableOpacity style={styles.actionButtonRow} onPress={() => setIsModalVisible(true)}>
          <MaterialIcons name="edit" size={moderateScale(14)} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Write Entry</Text>
        </TouchableOpacity>
      </View>

      {memories.length === 0 ? (
         <Text style={{ textAlign: 'center', color: Colors.gray, marginBottom: 20 }}>No journal entries yet.</Text>
      ) : (
        <FlatList
          data={memories}
          renderItem={({ item }) => <JournalCard item={item} />}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 15} 
          decelerationRate="fast"
          contentContainerStyle={{ gap: 15, paddingRight: cardSpacing, paddingBottom: 20, alignItems: 'flex-start' }}
        />
      )}

      {/* --- SHARED ALBUM SECTION --- */}
      <View style={[styles.sectionHeader, { marginTop: moderateScale(10) }]}>
        <Text style={styles.sectionTitle}>Shared Album</Text>
        <TouchableOpacity onPress={() => router.navigate(`/(trip-info)/${tripId}/album`)} hitSlop={3}>
          <Text style={styles.viewAllText}>View All ({totalPhotoCount})</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Photo Grid */}
      <View style={styles.photoGrid}>
        <TouchableOpacity style={styles.uploadTile} onPress={handleUploadSharedPhoto}>
          <MaterialIcons name="add-photo-alternate" size={moderateScale(28)} color={Colors.textSecondary} />
        </TouchableOpacity>

        {albumPhotos.slice(0, 5).map((photo) => {
           return (
             <View key={photo.id} style={styles.photoWrapper}>
               <Image source={{ uri: photo.uri }} style={styles.gridImage} contentFit="cover" transition={200} cachePolicy={'disk'} />
             </View>
           );
        })}
      </View>

      {/* --- BOTTOM SHEET FORM --- */}
      <AnimatedBottomSheet visible={isModalVisible} onClose={() => !isUploading && setIsModalVisible(false)}>
       <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>New Journal Entry</Text>
          <TouchableOpacity onPress={() => !isUploading && setIsModalVisible(false)} style={styles.closeButton}>
            <MaterialIcons name="close" size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          
          <TextInput 
            style={styles.premiumTitleInput} 
            placeholder="Name this adventure..." 
            placeholderTextColor="#94a3b8"
            value={entryTitle}
            onChangeText={setEntryTitle}
            editable={!isUploading}
            autoFocus
          />

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>STORY</Text>
            <TextInput 
              style={styles.premiumNotesInput} 
              placeholder="What made this moment special? Jot down the details..." 
              placeholderTextColor="#94a3b8"
              value={entryDescription}
              onChangeText={setEntryDescription}
              editable={!isUploading}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>PHOTOS ({entryImages.length})</Text>
            
            <TouchableOpacity style={styles.photoUploadRow} onPress={handleAddEntryImage} disabled={isUploading}>
                <View style={styles.photoIconCircle}>
                  <MaterialIcons name="add-a-photo" size={18} color="#0f172a" />
                </View>
                <Text style={styles.photoUploadText}>Attach photos</Text>
            </TouchableOpacity>

            {entryImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 10 }}>
                {entryImages.map((uri, index) => (
                  <View key={index}>
                    <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 12 }} contentFit="cover" />
                    <TouchableOpacity 
                      style={{
                        position: 'absolute', top: -6, right: -6, backgroundColor: Colors.danger, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white'
                      }} 
                      onPress={() => setEntryImages(prev => prev.filter((_, i) => i !== index))}
                      disabled={isUploading}
                    >
                      <MaterialIcons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.premiumSubmitButton, (!entryTitle.trim() || isUploading) && styles.premiumSubmitDisabled]} 
            disabled={!entryTitle.trim() || isUploading}
            onPress={handleSaveEntry}
          >
            <Text style={styles.premiumSubmitText}>{isUploading ? "Posting Entry..." : "Post Entry"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </AnimatedBottomSheet>

    </TripInfoScrollView>
  );
}

// ==========================================
// 3. STYLES
// ==========================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: '5%', paddingBottom: 40 },
  
  // --- Headers ---
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(16) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: '800', color: Colors.darkBlue },
  actionButtonRow: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  actionButtonText: { fontSize: moderateScale(12), color: Colors.primary, fontWeight: '700' },
  viewAllText: { fontSize: moderateScale(13), color: Colors.textSecondary, fontWeight: '600' },

  // --- Content-First Journal Card ---
  journalCardContentFirst: { 
    width: cardWidth, 
    minHeight: moderateScale(160), 
    backgroundColor: 'white', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#f1f5f9', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2, 
    padding: moderateScale(16),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9' },
  authorName: { fontSize: moderateScale(14), fontWeight: '700', color: Colors.darkBlue },
  dateTimeText: { fontSize: moderateScale(11), fontWeight: '500', color: '#64748b' },
  
  textContainer: {
    marginTop: 4,
  },
  entryTitleContentFirst: { 
    fontSize: moderateScale(17), 
    fontWeight: '800', 
    color: Colors.darkBlue, 
    marginBottom: 6 
  },
  entryDescriptionContentFirst: { 
    fontSize: moderateScale(14), 
    color: '#475569', 
    fontWeight: '400', 
    lineHeight: moderateScale(22) 
  },
  
  imageStripWrapper: {
    height: moderateScale(90), 
    marginTop: moderateScale(16), 
  },
  imageStripContainer: {
    gap: 10,
    paddingRight: 10,
  },
  stripImage: {
    width: moderateScale(120),
    height: moderateScale(90),
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },

  // --- Photo Grid ---
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%', width: '100%' },
  photoWrapper: { width: '32%', aspectRatio: 1, marginBottom: '2%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#f8fafc' },
  gridImage: { width: '100%', height: '100%' },
  uploadTile: { width: '32%', aspectRatio: 1, marginBottom: '2%', borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#cbd5e1', borderStyle: 'dashed' },

  // --- BOTTOM SHEET FORM (Aligned with Idea Board) ---
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  closeButton: { backgroundColor: '#f1f5f9', padding: 6, borderRadius: 16 },
  
  premiumTitleInput: { fontSize: 26, fontWeight: '700', color: '#0f172a', marginBottom: 30 },
  inputSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 12 },
  
  // Photo Row
  photoUploadRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 4 },
  photoIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  photoUploadText: { fontSize: 15, fontWeight: '500', color: '#0f172a' },
  
  // Notes & Submit
  premiumNotesInput: { fontSize: 15, color: '#0f172a', lineHeight: 22, paddingTop: 12, minHeight: 80 },
  premiumSubmitButton: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  premiumSubmitDisabled: { backgroundColor: '#cbd5e1' },
  premiumSubmitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});