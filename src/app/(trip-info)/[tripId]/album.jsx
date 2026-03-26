import { Colors } from "@/src/constants/colors";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. Import Supabase
import { supabase } from "@/src/lib/supabase";

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const imageSize = (screenWidth - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

const LIMIT = 21; // Perfect multiple of 3 columns

export default function AlbumScreen() {
  const router = useRouter();
  const { tripId } = useTrip();
  const [isModalVisible, setIsModalVisible] = useState(true);

  // --- State for DB data & Pagination ---
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // --- Fetch Photos Directly via Supabase Client (With Pagination) ---
  const fetchPhotos = async (isLoadMore = false) => {
    if (!tripId || isLoadingMore || (!hasMore && isLoadMore)) return;

    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    const currentOffset = isLoadMore ? photos.length : 0;

    try {
      // 1. DIRECT SUPABASE QUERY (Replaces the get-trip-album Edge Function)
      const { data: albumPhotos, error } = await supabase
        .from('Photos')
        .select('photo_id, photo_url, uploaded_at')
        .eq('trip_id', tripId)
        .order('uploaded_at', { ascending: false })
        .range(currentOffset, currentOffset + LIMIT - 1);

      if (error) throw error;

      if (albumPhotos) {
        if (albumPhotos.length < LIMIT) {
          setHasMore(false); // Reached the end of the DB
        }

        // 2. FORMAT DATA (Exactly how the Deno function did)
        const formattedAlbum = albumPhotos.map((photo) => ({
          id: photo.photo_id,
          uri: photo.photo_url,
          mock: false 
        }));

        // Append new photos if scrolling, otherwise replace
        if (isLoadMore) {
          setPhotos(prev => [...prev, ...formattedAlbum]);
        } else {
          setPhotos(formattedAlbum);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching album:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      // 1. Pick and compress the image
      const uri = await MediaUtils.pickImage();
      if (!uri) return;

      setIsLoading(true); 

      // 2. Let MediaUtils handle the heavy lifting!
      const CURRENT_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; // Dummy ID
      const newPhotoRecord = await MediaUtils.uploadImageToSupabase(uri, tripId, CURRENT_USER_ID);

      // 3. Update the UI instantly
      setPhotos(prevPhotos => [newPhotoRecord, ...prevPhotos]);

    } catch (err) {
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalVisible(false); 
    setTimeout(() => {
      // Go back to the memories tab
      router.navigate(`/(trip-info)/${tripId}/memories`);
    }, 300);
  };

  useFocusEffect(
    useCallback(() => {
      setIsModalVisible(true);
      setPhotos([]); 
      setHasMore(true);
      fetchPhotos(false, true);
    }, [tripId])
  );

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color={Colors.darkBlue} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shared Album</Text>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleUploadPhoto}>
            <MaterialIcons name="add-a-photo" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Loading State or Grid */}
        {isLoading && !isLoadingMore ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : photos.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: Colors.gray }}>No photos added yet.</Text>
          </View>
        ) : (
          <FlatList 
            data={photos}
            keyExtractor={(item, index) => item.photo_id?.toString() || index.toString()}
            numColumns={COLUMN_COUNT}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            
            // --- Infinite Scroll Triggers ---
            onEndReached={() => fetchPhotos(true)}
            onEndReachedThreshold={0.5} // Triggers when halfway through the last page
            ListFooterComponent={
              isLoadingMore ? <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 20 }} /> : null
            }

            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => console.log(`Open Full Screen Lightbox for photo: ${item.photo_id || item.id}`)}
              >
                <Image 
                  source={{ uri: item.photo_url || item.uri }} // Safely handles either DB column name
                  style={styles.gridImage} 
                  contentFit="cover" 
                  transition={200} 
                  cachePolicy="disk" // --- EXPLICIT CACHING ADDED HERE ---
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 40 },
  row: { gap: GAP, marginBottom: GAP },
  gridImage: { width: imageSize, height: imageSize, backgroundColor: '#E2E8F0' },
  customHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 12, paddingTop: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.darkBlue },
  headerIconBtn: { padding: 4 }
});