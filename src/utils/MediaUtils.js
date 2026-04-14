import { supabase } from '@/src/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
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
      
      // FIX 1: Pass the RLS policy by putting the userId at the root of the path
      const fileName = `${userId}/${tripId}_${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // FIX 2: Use Expo FileSystem to read as Base64 instead of the buggy fetch(uri)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Upload the decoded raw bytes to Supabase
      const { error: uploadError } = await supabase.storage
        .from('trip-media')
        .upload(fileName, decode(base64), {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        });

      if (uploadError) throw uploadError;

      // Get the public URL using the exact same path
      const { data: publicUrlData } = supabase.storage
        .from('trip-media')
        .getPublicUrl(fileName);

      // Create the database payload
      const dbPayload = {
        trip_id: tripId,
        uploader_id: userId,
        photo_url: publicUrlData.publicUrl,
        uploaded_at: new Date().toISOString(),
        type: type
      };
      
      if (entryId) dbPayload.entry_id = entryId;

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
      // 1. Compress the image
      const compressedUri = await MediaUtils.processImage(uri, 2000); 

      // 2. GET USER ID DYNAMICALLY (This satisfies the Supabase RLS Policy!)
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) throw new Error("User not authenticated");
      const userId = authData.user.id;

      const fileExt = compressedUri.split('.').pop()?.toLowerCase() || 'jpg';
      
      // 3. USE USER ID AS THE ROOT FOLDER (Fixes the RLS block!)
      const fileName = `${userId}/${tripId}_cover_${Date.now()}.${fileExt}`;

      // 4. Read as Base64 using Expo FileSystem
      const base64 = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: 'base64',
      });

      // 5. Upload raw binary to your 'trip-covers' bucket
      const { error: uploadError } = await supabase.storage
        .from('trip-covers') 
        .upload(fileName, decode(base64), {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 6. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('trip-covers')
        .getPublicUrl(fileName);

      const newCoverUrl = publicUrlData.publicUrl;

      // 7. Update the Trips table
      const { error: dbError } = await supabase
        .from('Trips') 
        .update({ cover_photo_url: newCoverUrl }) 
        .eq('trip_id', tripId);

      if (dbError) throw dbError;

      return newCoverUrl;

    } catch (err) {
      console.error("Error uploading cover photo:", err);
      throw err; 
    }
  }
};