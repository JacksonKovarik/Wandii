import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const DocumentCard = ({ title, size, date }) => {
  const lastDotIndex = title.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? title.substring(0, lastDotIndex) : title;
  const fileType = lastDotIndex !== -1 ? title.substring(lastDotIndex + 1) : '';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: moderateScale(10), borderRadius: moderateScale(10), marginBottom: moderateScale(15), gap: moderateScale(15) }}>
      <View style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: Colors.lightGray }} />
      <View>
        <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: Colors.darkBlue }}>{name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(5) }}>
          <Text style={{ fontSize: moderateScale(12), color: Colors.gray }}>{fileType.toUpperCase()} </Text>
          <Text style={{ fontSize: moderateScale(16), color: Colors.gray, marginTop: moderateScale(-1), fontWeight: '700'}}>•</Text>
          <Text style={{ fontSize: moderateScale(12), color: Colors.gray }}> {size} </Text>
          <Text style={{ fontSize: moderateScale(16), color: Colors.gray, marginTop: moderateScale(-1), fontWeight: '700'}}>•</Text>
          <Text style={{ fontSize: moderateScale(12), color: Colors.gray }}> {date}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => console.log(`Download ${title} pressed`)} style={{ padding: moderateScale(5), marginLeft: 'auto', marginRight: moderateScale(5) }}>
        <MaterialIcons name="save-alt" size={moderateScale(18)} color={Colors.gray} />
      </TouchableOpacity>
    </View>
  );
};

export default function Docs() {
  const { documents = [], refreshTripData } = useTrip();
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current; // 300 pushes it off-screen initially

  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  };



  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    console.log(result);
    if (!result.canceled) {
      console.log(result.assets[0].uri)
      setModalVisible(false);
      return result.assets[0].uri;
    }
    return null;
  }

  return (
    <TripInfoScrollView 
      style={styles.container} 
      onRefresh={refreshTripData}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Documents */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
        <Text style={styles.sectionTitle}>Travel Documents</Text>
        <TouchableOpacity style={{ flexDirection: 'row', gap: 5 }}onPress={() => openModal()}>
          <MaterialIcons name="upload" size={moderateScale(18)} color={Colors.primary} />
          <Text style={styles.newEntryButton}>Upload</Text>
        </TouchableOpacity>
        
      </View>
      {documents.map((doc) => (
        <DocumentCard key={doc.id} title={doc.title} date={doc.date} size={doc.size} />
      ))}

      <TouchableOpacity style={styles.uploadContainer} onPress={() => openModal()}>
        <MaterialIcons name="cloud-upload" size={moderateScale(24)} color={Colors.gray} />
        <Text style={styles.uploadText}>Tap to upload PDF or Image</Text>
      </TouchableOpacity>      
      {/* --- Upload Modal --- */}
      <AnimatedBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <Text style={styles.sheetTitle}>Add Document</Text>
        
        <TouchableOpacity style={styles.sheetButton} onPress={() => MediaUtils.takePhoto()}>
          <MaterialIcons name="photo-camera" size={24} color={Colors.primary} />
          <Text style={styles.sheetButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetButton} onPress={() => MediaUtils.pickImage()}>
          <MaterialIcons name="photo-library" size={24} color={Colors.primary} />
          <Text style={styles.sheetButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetButton} onPress={() => pickDocument()}>
          <MaterialIcons name="folder" size={24} color={Colors.primary} />
          <Text style={styles.sheetButtonText}>Browse Files (PDF)</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </AnimatedBottomSheet>

    </TripInfoScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

  },
  scrollContent: {
    padding: '5%',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  newEntryButton: {
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(20),
    marginBottom: moderateScale(10),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.gray,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: moderateScale(14),
    color: Colors.gray,
    marginTop: moderateScale(5),
  },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    paddingBottom: moderateScale(40), 
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: moderateScale(20),
    textAlign: 'center',
  },
  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    gap: moderateScale(15),
  },
  sheetButtonText: {
    fontSize: moderateScale(16),
    color: Colors.darkBlue,
  },
  cancelButton: {
    marginTop: moderateScale(20),
    alignItems: 'center',
    paddingVertical: moderateScale(10),
  },
  cancelButtonText: {
    fontSize: moderateScale(16),
    color: Colors.gray,
    fontWeight: '600',
  }
});