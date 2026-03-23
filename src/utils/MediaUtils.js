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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
  }
};