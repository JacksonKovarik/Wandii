import { supabase } from '@/src/lib/supabase';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export const MediaUtils = {
  // --- HELPER: RESIZE & COMPRESS ---
  processImage: async (uri, width) => {
    // If the image is already small, return it as-is
    if (width <= 1080) return uri;

    // Otherwise, scale it down to 1080p max width
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // Maintain aspect ratio automatically
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return manipResult.uri;
  },

  // --------------------------------------------------
  // 1. Pick an Image from the Device Library
  // --------------------------------------------------
  pickImage: async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permission.granted) {
      if (!permission.canAskAgain) {
        Alert.alert(
          "Permission Denied",
          "You previously denied access. Please go to your device settings to enable it.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return null;
      }
      Alert.alert("Required", "We need permission to access your photos.");
      return null;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // First pass of compression
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      // Process it to ensure max 1080p width
      return await MediaUtils.processImage(asset.uri, asset.width);
    }
    
    return null;
  },

  // --------------------------------------------------
  // 2. Request Camera Permissions
  // --------------------------------------------------
  requestCameraPermission: async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    
    if (!permission.granted) {
      if (!permission.canAskAgain) {
        Alert.alert(
          "Permission Denied",
          "You previously denied camera access. Please go to your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      Alert.alert("Required", "We need permission to access your camera to take photos.");
      return false;
    }
    return true;
  },

  // --------------------------------------------------
  // 3. Take a Photo
  // --------------------------------------------------
  takePhoto: async () => {
    const hasPermission = await MediaUtils.requestCameraPermission();
    if (!hasPermission) return null;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Compress raw camera output
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      // Process it to ensure max 1080p width
      return await MediaUtils.processImage(asset.uri, asset.width);
    }
    
    return null;
  },

  // --------------------------------------------------
  // 4. Upload an Image to Supabase Storage & Database
  // --------------------------------------------------
  uploadImageToSupabase: async (uri, tripId, userId, entryId = null, type = 'memories') => {
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${tripId}/${fileName}`;
      
      // 1. Fetch the local file directly into raw binary (Zero Base64!)
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      // 2. Upload the raw bytes directly to Supabase
      const { error: uploadError } = await supabase.storage
        .from('trip-media')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        });

      if (uploadError) throw uploadError;

      // 3. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('trip-media')
        .getPublicUrl(filePath);

      // 4. Create the database payload
      const dbPayload = {
        trip_id: tripId,
        uploader_id: userId,
        photo_url: publicUrlData.publicUrl,
        uploaded_at: new Date().toISOString(),
        type: type
      };
      
      // Attach to journal entry if applicable
      if (entryId) dbPayload.entry_id = entryId;

      // 5. Insert into the Photos table
      const { data: dbData, error: dbError } = await supabase
        .from('Photos')
        .insert(dbPayload)
        .select()
        .single();

      if (dbError) throw dbError;
      return dbData;

    } catch (err) {
      console.error("MediaUtils Upload Error:", err);
      throw err; 
    }
  },

  // --------------------------------------------------
  // 5. Upload & Update Trip Cover Photo
  // --------------------------------------------------
  uploadTripCover: async (uri, tripId) => {
    try {
      // 1. Compress the image first using your existing utility (max width 2000px for a crisp cover)
      const compressedUri = await MediaUtils.processImage(uri, 2000); 

      // 2. Fetch using arrayBuffer instead of blob (Better for React Native)
      const response = await fetch(compressedUri);
      const arrayBuffer = await response.arrayBuffer();

      const fileExt = compressedUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${tripId}/cover_${Date.now()}.${fileExt}`;

      // 3. Upload raw binary to your 'trip-covers' bucket
      const { error: uploadError } = await supabase.storage
        .from('trip-covers') 
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 4. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('trip-covers')
        .getPublicUrl(fileName);

      const newCoverUrl = publicUrlData.publicUrl;

      // 5. Update the Trips table directly
      const { error: dbError } = await supabase
        .from('Trips') // <-- Make sure this matches your exact table name in Supabase
        .update({ cover_photo: newCoverUrl }) 
        .eq('trip_id', tripId);

      if (dbError) throw dbError;

      return newCoverUrl;

    } catch (err) {
      console.error("Error uploading cover photo:", err);
      throw err; 
    }
  }
};