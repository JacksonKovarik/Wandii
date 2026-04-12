import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import DocumentCard from "@/src/components/trip-info/docs/documentCard";
import TripInfoScrollView from "@/src/components/trip-info/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { useDocsData } from "@/src/hooks/useDocsData";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";


export default function Docs() {
  const { tripId, refreshTripData } = useTrip(); 

  const {
    documents, 
    isLoading, 
    modalVisible,
    setModalVisible,
    handleRefresh,
    handleImageUpload,
    pickDocument,
  } = useDocsData(tripId, refreshTripData);

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

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : documents.length === 0 ? (
        <View style={styles.emptyDocsContainer}>
          <View style={styles.emptyDocsIconWrapper}>
            <MaterialIcons name="folder-shared" size={moderateScale(50)} color={Colors.gray || '#94a3b8'} />
          </View>
          <Text style={styles.emptyDocsTitle}>No documents yet</Text>
          <Text style={styles.emptyDocsSubtext}>
            Keep your boarding passes, reservations, and passports safe and easily accessible for the whole group.
          </Text>
          <TouchableOpacity 
            style={styles.uploadDocsBtn}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="cloud-upload" size={moderateScale(20)} color="white" />
            <Text style={styles.uploadDocsBtnText}>Upload Document</Text>
          </TouchableOpacity>
        </View>  
      ) : (
        documents.map((doc) => (
          <DocumentCard key={doc.id} title={doc.title} date={doc.date} size={doc.size} url={doc.url} fileType={doc.file_type} />
        ))
      )}

      <AnimatedBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Add Document</Text>
          
          <View style={styles.sheetActionGroup}>
            {/* FIX: Wired up the media functions so they actually process and upload to Supabase */}
            <TouchableOpacity style={styles.sheetMinimalRow} onPress={() => handleImageUpload(MediaUtils.takePhoto)}>
              <MaterialIcons name="photo-camera" size={24} color={Colors.darkBlue} />
              <Text style={styles.sheetActionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetMinimalRow} onPress={() => handleImageUpload(MediaUtils.pickImage)}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: '5%', paddingBottom: moderateScale(40) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: '800', color: Colors.darkBlue },
  headerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newEntryButton: { fontSize: moderateScale(16), fontWeight: '600', color: Colors.primary },
  uploadContainer: { alignItems: 'center', justifyContent: 'center', padding: moderateScale(20), marginTop: moderateScale(8), borderRadius: moderateScale(12), borderWidth: 1, borderColor: Colors.gray, borderStyle: 'dashed' },
  uploadText: { fontSize: moderateScale(14), color: Colors.gray, marginTop: moderateScale(8) },
  sheetContent: { paddingHorizontal: moderateScale(10) },
  sheetTitle: { fontSize: moderateScale(18), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(24), textAlign: 'center' },
  sheetActionGroup: {},
  sheetMinimalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: moderateScale(16), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray, gap: moderateScale(16) },
  sheetActionText: { fontSize: moderateScale(16), fontWeight: '500', color: Colors.darkBlue },
  cancelButton: { marginTop: moderateScale(24), alignItems: 'center', paddingVertical: moderateScale(12) },
  cancelButtonText: { fontSize: moderateScale(16), color: Colors.gray, fontWeight: '600' },
  // --- EMPTY STATE STYLES ---
  emptyDocsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(30),
    marginTop: moderateScale(20),
    borderWidth: 2,
    borderColor: '#e2e8f0', // Light slate
    borderStyle: 'dashed',
  },
  emptyDocsIconWrapper: {
    marginBottom: moderateScale(16),
    opacity: 0.8,
  },
  emptyDocsTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.darkBlue || '#0f172a',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  emptyDocsSubtext: {
    fontSize: moderateScale(14),
    color: Colors.textSecondaryDark || '#64748b',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(24),
  },
  uploadDocsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkBlue || '#0f172a',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(25),
    gap: moderateScale(8), // Puts space between the icon and text
  },
  uploadDocsBtnText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
});