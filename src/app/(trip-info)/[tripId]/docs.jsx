import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        <TouchableOpacity style={{ flexDirection: 'row', gap: 5 }}onPress={() => setModalVisible(true)}>
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
      {/* --- Ultra-Minimal Bottom Sheet --- */}
      <AnimatedBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Add Document</Text>
          
          <View style={styles.sheetActionGroup}>
            <TouchableOpacity style={styles.sheetMinimalRow} onPress={() => MediaUtils.takePhoto()}>
              <MaterialIcons name="photo-camera" size={24} color={Colors.darkBlue} />
              <Text style={styles.sheetActionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetMinimalRow} onPress={() => MediaUtils.pickImage()}>
              <MaterialIcons name="photo-library" size={24} color={Colors.darkBlue} />
              <Text style={styles.sheetActionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetMinimalRow} onPress={() => pickDocument()}>
              <MaterialIcons name="folder" size={24} color={Colors.darkBlue} />
              <Text style={styles.sheetActionText}>Browse Files</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: moderateScale(40),
  },
  
  // --- Header Styles ---
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: moderateScale(20) 
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: Colors.darkBlue,
  },
  headerActionBtn: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 4,
  },
  newEntryButton: {
    fontSize: moderateScale(16), // Slightly larger text
    fontWeight: '600',
    color: Colors.primary,
  },

  // --- Document Card (Restored to flatter look) ---
  documentCard: {
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: moderateScale(12), 
    borderRadius: moderateScale(12), 
    marginBottom: moderateScale(12), 
    gap: moderateScale(12),
  },
  documentIconPlaceholder: {
    width: moderateScale(50), 
    height: moderateScale(50), 
    borderRadius: moderateScale(8), 
    backgroundColor: Colors.lightGray, // Back to your original soft gray
  },
  documentTitle: {
    fontSize: moderateScale(15), 
    fontWeight: '700', 
    color: Colors.darkBlue,
    marginBottom: moderateScale(4),
  },
  documentMetaRow: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  documentMetaText: {
    fontSize: moderateScale(12), 
    color: Colors.gray, 
  },
  documentMetaDot: {
    fontSize: moderateScale(14), 
    color: Colors.gray, 
    marginHorizontal: moderateScale(6),
    marginTop: moderateScale(-2), // Adjusts baseline visually
  },
  downloadBtn: {
    padding: moderateScale(8), 
    justifyContent: 'center',
  },

  // --- Upload Box Styles ---
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(20),
    marginTop: moderateScale(8),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.gray,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: moderateScale(14),
    color: Colors.gray,
    marginTop: moderateScale(8),
  },

  // --- Sheet Styles ---
  sheetContent: {
    paddingHorizontal: moderateScale(10),
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: moderateScale(24),
    textAlign: 'center',
  },
  sheetActionGroup: {
    // Let the rows breathe naturally
  },
  sheetMinimalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(16), // Lots of vertical breathing room
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinnest possible line, just for structure
    borderBottomColor: Colors.lightGray,
    gap: moderateScale(16),
  },
  sheetActionText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: Colors.darkBlue,
  },
  cancelButton: {
    marginTop: moderateScale(24),
    alignItems: 'center',
    paddingVertical: moderateScale(12),
  },
  cancelButtonText: {
    fontSize: moderateScale(16),
    color: Colors.gray, // Muted out since it's a secondary action
    fontWeight: '600',
  }
});