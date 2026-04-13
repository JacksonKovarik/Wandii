import SettingRow from "@/src/components/trip-info/settings/settingRow";
import { Colors } from "@/src/constants/colors";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tripId, destination, name, image, defaultCurrency, group } = useTripDashboard();
  
  const [requireApprovals, setRequireApprovals] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleClose = () => {
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.navigate(`/(trip-info)/${tripId}/overview`);
    }, 300);
  };

  const handleCoverPhotoPress = () => {
    Alert.alert(
      "Update Cover Photo",
      "Choose a photo source",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const uri = await MediaUtils.takePhoto();
            if (uri) processCoverPhotoUpload(uri);
          }
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const uri = await MediaUtils.pickImage();
            if (uri) processCoverPhotoUpload(uri);
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const processCoverPhotoUpload = async (uri) => {
    setIsUploadingPhoto(true);
    try {
      const newUrl = await MediaUtils.uploadTripCover(uri, tripId);
      
      // Update the TanStack cache directly instead of updateTripContext
      queryClient.setQueryData(['tripDashboard', tripId], (old) => {
          if (!old) return old;
          return { ...old, image: newUrl };
      });
      
      Alert.alert("Success", "Cover photo updated!");
    } catch (error) {
      Alert.alert("Upload Failed", "There was an error updating your cover photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* --- Minimal Header --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <MaterialIcons name="close" size={26} color={Colors.darkBlue} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.pageTitle}>Trip Settings</Text>
        {/* SECTION: Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Details</Text>
          <SettingRow 
            icon="edit" 
            title="Trip Name" 
            value={name} 
            onPress={() => {
              router.push({
                pathname: `/(trip-info)/${tripId}/(settings)/editField`,
                params: { 
                  fieldKey: 'name', 
                  fieldLabel: 'Trip Name', 
                  currentValue: name && name !== undefined ? name : name
                }
              });
            }} 
          />
          {/* MAKE SURE FOR OPTIMISTIC UPDATES */}
          <SettingRow 
            icon="place" 
            title="Destination" 
            value={destination.length > 1 ? `${destination.length} destinations` : destination.length == 1 ? `${destination[0].city}, ${destination[0].country}` : 'No destinations'} 
            onPress={() => router.push(`/(trip-info)/${tripId}/(settings)/editDestination`)}
          />
          {/* ADD PHOTO PICKING HERE */}
          <SettingRow 
            icon="image" 
            title="Cover Photo" 
            value={isUploadingPhoto ? "Uploading..." : (image ? "Change Photo" : "Add Photo")}
            onPress={isUploadingPhoto ? null : handleCoverPhotoPress} // Disable clicking while uploading          
          />
        </View>

        {/* SECTION: Group & Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Group</Text>
          <SettingRow 
            icon="people" 
            title="Manage Members" 
            value={`${group.length} members`}
            onPress={() => router.push(`/(trip-info)/${tripId}/(settings)/manageMembers`)} />
          <SettingRow 
            icon="link" 
            title="Share Invite Link" 
            onPress={() => console.log('Share')} />
          <SettingRow 
            type="switch" 
            icon="security" 
            title="Require Join Approval" 
            value={requireApprovals} 
            onPress={() => setRequireApprovals(!requireApprovals)} 
          />
        </View>

        {/* SECTION: Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <SettingRow 
            icon="payments" 
            title="Default Currency" 
            value={defaultCurrency || 'USD'} 
            onPress={() => router.push(`/(trip-info)/${tripId}/(settings)/editCurrency`)} 
          />
        </View>

        {/* SECTION: Danger Zone */}
        <View style={[styles.section, { borderBottomWidth: 0, marginBottom: 0 }]}>
          <SettingRow icon="exit-to-app" title="Leave Trip" isDestructive onPress={() => console.log('Leave')} />
          <SettingRow icon="delete-forever" title="Delete Trip" isDestructive onPress={() => console.log('Delete')} />
        </View>

        <Text style={styles.footerText}>Wandii App Version 1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(10),
  },
  closeBtn: {
    padding: moderateScale(4),
  },
  scrollContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: moderateScale(26),
    fontWeight: '800',
    color: Colors.darkBlue,
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(30),
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: moderateScale(32),
    paddingHorizontal: moderateScale(24),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightGray,
    paddingBottom: moderateScale(16),
  },
  sectionHeader: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: Colors.darkBlue,
    marginBottom: moderateScale(16),
  },
  footerText: {
    textAlign: 'center',
    color: Colors.textSecondaryLight,
    marginTop: moderateScale(10),
    marginBottom: moderateScale(40),
    fontSize: moderateScale(12),
    fontWeight: '500',
  }
});