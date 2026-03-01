import { Colors } from "@/src/constants/colors";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: screenWidth } = Dimensions.get('window');
// Calculate exactly 1/3 of the screen, minus a tiny gap
const COLUMN_COUNT = 3;
const GAP = 2;
const imageSize = (screenWidth - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export default function AlbumScreen() {
  const router = useRouter();
  const { tripId } = useTrip();
  const [isModalVisible, setIsModalVisible] = useState(true);

  // In reality, this will be fetched from your database containing the S3 URLs
  const [photos, setPhotos] = useState([
    { id: '1', uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1545569341-9eb8b3097314?q=80&w=800&auto=format&fit=crop' },
    { id: '4', uri: 'https://images.unsplash.com/photo-1542051812-f47096fb016d?q=80&w=800&auto=format&fit=crop' },
    { id: '5', uri: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=800&auto=format&fit=crop' },
    // ... add as many as you want to test scrolling!
  ]);

  const handleUploadPhoto = async () => {
    const uri = await MediaUtils.pickImage();
    if (uri) {
      // 1. (Future) Ask backend for S3 Presigned URL
      // 2. (Future) fetch(presignedUrl, { method: 'PUT', body: imageFile })
      // 3. (Future) Save S3 URL to your Database
      
      // For now, optimistic UI update:
      const newPhoto = { id: Date.now().toString(), uri: uri };
      setPhotos(prev => [newPhoto, ...prev]);
    }
  };

  const handleClose = () => {
    // 1. Tell the modal to slide down
    setIsModalVisible(false); 
    
    // 2. Wait 300ms for the animation to finish, then safely route away
    setTimeout(() => {
      router.navigate(`/(trip-info)/${tripId}/memories`);
    }, 300);
  };

  useFocusEffect(
    useCallback(() => {
      setIsModalVisible(true);
    }, [])
  );

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet" // Gives the native iOS swipe-down card feel!
      onRequestClose={() => handleClose()} // Handles the Android hardware back button
    >
      <View style={styles.container}>
        <View style={styles.customHeader}>
          
          {/* Left: Close Button (Changed from Back Arrow) */}
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            // router.back() instantly unmounts the route, sliding the modal down
            onPress={() => handleClose()} 
          >
            <MaterialIcons name="close" size={24} color={Colors.darkBlue} />
          </TouchableOpacity>

          {/* Center: Title */}
          <Text style={styles.headerTitle}>Shared Album</Text>

          {/* Right: Add Photo Button */}
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleUploadPhoto}>
            <MaterialIcons name="add-a-photo" size={22} color={Colors.primary} />
          </TouchableOpacity>

        </View>

        {/* The 3-Column Grid */}
        <FlatList
          data={photos}
          keyExtractor={item => item.id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => console.log(`Open Full Screen Lightbox for photo: ${item.id}`)}
            >
              <Image 
                source={{ uri: item.uri }} 
                style={styles.gridImage} 
                contentFit="cover" 
                transition={200} 
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Using your off-white background color adds contrast against the pure white header
    backgroundColor: Colors.background, 
  },
  listContent: {
    paddingBottom: 40, 
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  gridImage: {
    width: imageSize,
    height: imageSize,
    backgroundColor: '#E2E8F0', // Slightly darker placeholder so it doesn't blend into white
  },
  
  // --- Custom Header Styles ---
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12, // Tighter padding
    paddingTop: 12,
    // Removed the shadow entirely for a flatter, cleaner integration with the tabs above it
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  headerIconBtn: {
    width: 40, 
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // Removed the background colors completely!
  },
});