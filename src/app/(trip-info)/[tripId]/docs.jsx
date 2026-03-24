import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";


//////////////////////////////////////////////////////////////////

// ADD automatic images/icons for different file uploads

//////////////////////////////////////////////////////////////////


const DocumentCard = ({ title, size, date }) => {
  const lastDotIndex = title.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? title.substring(0, lastDotIndex) : title;
  const fileType = lastDotIndex !== -1 ? title.substring(lastDotIndex + 1) : '';

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentIconPlaceholder} />
      <View style={{ flex: 1 }}>
        <Text style={styles.documentTitle} numberOfLines={1}>{name}</Text>
        <View style={styles.documentMetaRow}>
          <Text style={styles.documentMetaText}>{fileType.toUpperCase()}</Text>
          <Text style={styles.documentMetaDot}>•</Text>
          <Text style={styles.documentMetaText}>{size}</Text>
          <Text style={styles.documentMetaDot}>•</Text>
          <Text style={styles.documentMetaText}>{date}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => console.log(`Download ${title} pressed`)} style={styles.downloadBtn}>
        <MaterialIcons name="save-alt" size={moderateScale(18)} color={Colors.gray} />
      </TouchableOpacity>
    </View>
  );
};

export default function Docs() {
  // Assuming tripId is available in your TripContext. 
  // You will also need the current userId (often from an AuthContext or Supabase auth session).
  const { tripId, refreshTripData } = useTrip(); 
  // const { userId } = useAuth(); // Example: Get this from wherever you store auth state

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // --- Fetch Data from Edge Function via Supabase Client ---
  const fetchDocuments = async () => {
    if (!tripId) {
      console.log("No Trip ID")
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Using your hardcoded dev user ID to match your other functions
      const TEMP_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; 
      
      console.log(`Fetching documents for trip: ${tripId}`);

      const { data, error } = await supabase.functions.invoke('get-trip-docs', { // Ensure 'get-documents' matches your Supabase function name
        body: { tripId, userId: TEMP_USER_ID }
      });

      if (error) {
        console.error("Edge Function Error fetching documents:", error);
        return; // Exit early, but 'finally' will still run
      }

      if (data) {
        setDocuments(data);
      }

    } catch (err) {
      console.error("Unexpected network/execution error:", err);
    } finally {
      // This guarantees the spinner goes away whether it succeeds or fails
      setIsLoading(false); 
    }
  };

  // Trigger fetch on mount and when tripId/userId changes
  useEffect(() => {
    fetchDocuments();
  }, [tripId]);

  // Wrapper for refreshing data (handles pull-to-refresh)
  const handleRefresh = async () => {
    if (refreshTripData) await refreshTripData();
    await fetchDocuments();
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      console.log(result.assets[0].uri);
      setModalVisible(false);
      // TODO: Implement the actual upload logic here
      return result.assets[0].uri;
    }
    return null;
  };

  return (
    <TripInfoScrollView 
      style={styles.container} 
      onRefresh={handleRefresh}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Travel Documents</Text>
        <TouchableOpacity style={styles.headerActionBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="upload" size={moderateScale(18)} color={Colors.primary} />
          <Text style={styles.newEntryButton}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State or Document List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : documents.length === 0 ? (
        <Text style={{ textAlign: 'center', color: Colors.gray, marginTop: 20 }}>No documents uploaded yet.</Text>
      ) : (
        documents.map((doc) => (
          <DocumentCard key={doc.id} title={doc.title} date={doc.date} size={doc.size} />
        ))
      )}

      <TouchableOpacity style={styles.uploadContainer} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="cloud-upload" size={moderateScale(24)} color={Colors.gray} />
        <Text style={styles.uploadText}>Tap to upload PDF or Image</Text>
      </TouchableOpacity>      

      {/* --- Bottom Sheet --- */}
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

// ... [Keep your existing styles exactly as they were] ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: '5%', paddingBottom: moderateScale(40) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: '800', color: Colors.darkBlue },
  headerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newEntryButton: { fontSize: moderateScale(16), fontWeight: '600', color: Colors.primary },
  documentCard: { flexDirection: 'row', backgroundColor: 'white', padding: moderateScale(12), borderRadius: moderateScale(12), marginBottom: moderateScale(12), gap: moderateScale(12) },
  documentIconPlaceholder: { width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(8), backgroundColor: Colors.lightGray },
  documentTitle: { fontSize: moderateScale(15), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(4) },
  documentMetaRow: { flexDirection: 'row', alignItems: 'center' },
  documentMetaText: { fontSize: moderateScale(12), color: Colors.gray },
  documentMetaDot: { fontSize: moderateScale(14), color: Colors.gray, marginHorizontal: moderateScale(6), marginTop: moderateScale(-2) },
  downloadBtn: { padding: moderateScale(8), justifyContent: 'center' },
  uploadContainer: { alignItems: 'center', justifyContent: 'center', padding: moderateScale(20), marginTop: moderateScale(8), borderRadius: moderateScale(12), borderWidth: 1, borderColor: Colors.gray, borderStyle: 'dashed' },
  uploadText: { fontSize: moderateScale(14), color: Colors.gray, marginTop: moderateScale(8) },
  sheetContent: { paddingHorizontal: moderateScale(10) },
  sheetTitle: { fontSize: moderateScale(18), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(24), textAlign: 'center' },
  sheetActionGroup: {},
  sheetMinimalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: moderateScale(16), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray, gap: moderateScale(16) },
  sheetActionText: { fontSize: moderateScale(16), fontWeight: '500', color: Colors.darkBlue },
  cancelButton: { marginTop: moderateScale(24), alignItems: 'center', paddingVertical: moderateScale(12) },
  cancelButtonText: { fontSize: moderateScale(16), color: Colors.gray, fontWeight: '600' }
});