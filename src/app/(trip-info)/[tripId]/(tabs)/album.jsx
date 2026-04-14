import { Colors } from "@/src/constants/colors";
import { useAlbumData } from "@/src/hooks/useAlbumData";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageViewing from "react-native-image-viewing"; // <-- 1. Import the viewer

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const imageSize = (screenWidth - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export default function AlbumScreen() {
  const router = useRouter();
  const { tripId } = useTripDashboard();
  const [isModalVisible, setIsModalVisible] = useState(true);

  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
 
  const { 
    photos, 
    isLoading, 
    isLoadingMore, 
    hasNextPage, 
    fetchNextPage, 
    refetch,
    uploadPhoto,
    isUploading
  } = useAlbumData(tripId);

  useFocusEffect(
    useCallback(() => {
      setIsModalVisible(true);
      refetch(); // Ensure we have the freshest data when modal opens
    }, [tripId, refetch])
  );

  const viewerImages = photos.map(photo => ({ uri: photo.uri }));

  const handleUploadPhoto = async () => {
    try {
      const uri = await MediaUtils.pickImage();
      if (!uri) return;
      await uploadPhoto(uri);
    } catch (err) {
      alert("Failed to upload photo. Please try again.");
    }
  };

  const handleClose = () => {
    setIsModalVisible(false); 
    setTimeout(() => {
      router.navigate(`/(trip-info)/${tripId}/memories`);
    }, 300);
  };

  const loadMorePhotos = () => {
    if (hasNextPage && !isLoadingMore) {
        fetchNextPage();
    }
  };

  return (
    <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color={Colors.darkBlue} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shared Album</Text>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleUploadPhoto} disabled={isUploading}>
            {isUploading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
                <MaterialIcons name="add-a-photo" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Loading State or Grid */}
        {isLoading ? (
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
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            numColumns={COLUMN_COUNT}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            
            // --- Infinite Scroll Triggers ---
            onEndReached={loadMorePhotos}
            onEndReachedThreshold={0.5} 
            ListFooterComponent={
              isLoadingMore ? <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 20 }} /> : null
            }

            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.8} onPress={() => {
                setIsViewerVisible(true);
                setCurrentImageIndex(photos.findIndex(photo => photo.id === item.id));
              }}>
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.gridImage} 
                  contentFit="cover" 
                  transition={200} 
                  cachePolicy="disk" 
                />
              </TouchableOpacity>
            )}
          />
        )}
        <ImageViewing
          images={viewerImages}
          imageIndex={currentImageIndex}
          visible={isViewerVisible}
          onRequestClose={() => setIsViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
        />
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