import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export const MediaUtils = {
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
      Alert.alert(
        "Required", 
        "We need permission to access your photos."
      );
      return null;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to use MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log(result.assets[0].uri);
      return result.assets[0].uri;
    }
    
    return null;
  },

  // --------------------------------------------------
  // 2. Request Camera Permissions (using expo-camera)
  // --------------------------------------------------
  requestCameraPermission: async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    
    if (!permission.granted) {
      if (!permission.canAskAgain) {
        Alert.alert(
          "Permission Denied",
          "You previously denied camera access. Please go to your device settings to enable it.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      Alert.alert(
        "Required", 
        "We need permission to access your camera to take photos."
      );
      return false;
    }
    return true;
  },

  // --------------------------------------------------
  // 3. Take a Photo (Uses permission check + Image Picker)
  // --------------------------------------------------
  takePhoto: async () => {
    // Check/Ask for permission first using our new utility function
    const hasPermission = await MediaUtils.requestCameraPermission();
    if (!hasPermission) return null;

    // Launch the native camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log(result.assets[0].uri);
      return result.assets[0].uri;
    }
    
    return null;
  }
};