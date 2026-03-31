import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { MediaUtils } from "@/src/utils/MediaUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const DocumentCard = ({ title, size, date, url, fileType}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const lastDotIndex = title.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? title.substring(0, lastDotIndex) : title;

  // --- 1. DYNAMIC THUMBNAIL LOGIC ---
  const getIconConfig = () => {
    const ext = fileType?.toLowerCase() || '';
    
    if (ext === 'pdf') 
      return { name: 'picture-as-pdf', color: '#EF4444', bg: '#FEE2E2' };
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) 
      return { name: 'image', color: '#8B5CF6', bg: '#EDE9FE' };
    
    if (['doc', 'docx', 'txt'].includes(ext)) 
      return { name: 'description', color: '#3B82F6', bg: '#DBEAFE' };
    
    if (['xls', 'xlsx', 'csv'].includes(ext)) 
      return { name: 'table-view', color: '#10B981', bg: '#D1FAE5' };
    
    return { name: 'insert-drive-file', color: '#6B7280', bg: '#F3F4F6' }; 
  };

  const iconConfig = getIconConfig();

  // --- 2. SMART CACHING & DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (!url) {
      alert("Error: File URL is missing.");
      return;
    }

    try {
      setIsDownloading(true);

      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
      const lastUnderscore = cleanName.lastIndexOf('_');

      const safeFileName = `${cleanName.substring(0, lastUnderscore > 0 ? lastUnderscore : cleanName.length)}.${fileType}`;
      
      const destinationDir = new Directory(Paths.document, 'trip_downloads');
      if (!destinationDir.exists) {
        destinationDir.create();
      }
      
      const localFile = new File(destinationDir, safeFileName);

      if (localFile.exists) {
        console.log("Valid file found locally! Opening...");
        await Sharing.shareAsync(localFile.uri);
        return; 
      } 
      
      console.log("Downloading fresh file from Supabase...");

      // FIX: Call downloadAsync directly on the file instance
      await localFile.downloadAsync(url);
      
      await Sharing.shareAsync(localFile.uri);

    } catch (error) {
      console.error("Download error:", error);
      alert("There was an issue downloading this file.");
    } finally {
      setIsDownloading(false);
    }
  };

  const convertFileSize = (bytes) => {
    if (bytes === 0 || bytes === 'Unknown Size') return 'Unknown Size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1000));
    return `${(bytes / Math.pow(1000, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  // FIX: Create a new variable instead of mutating the React prop
  const formattedSize = convertFileSize(size);

  return (
    <View style={styles.documentCard}>
      <View style={[styles.documentIconPlaceholder, { backgroundColor: iconConfig.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name={iconConfig.name} size={moderateScale(28)} color={iconConfig.color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.documentTitle} numberOfLines={1}>{name}</Text>
        <View style={styles.documentMetaRow}>
          <Text style={styles.documentMetaText}>{fileType?.toUpperCase()}</Text>
          <Text style={styles.documentMetaDot}>•</Text>
          <Text style={styles.documentMetaText}>{formattedSize}</Text>
          <Text style={styles.documentMetaDot}>•</Text>
          <Text style={styles.documentMetaText}>{date}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleDownload} 
        style={styles.downloadBtn}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <MaterialIcons name="save-alt" size={moderateScale(18)} color={Colors.gray} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function Docs() {
  const { tripId, refreshTripData } = useTrip(); 

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDocuments = async () => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // FIX: Removed the uploader_id filter so everyone in the group can see the files!
      const { data: docs, error } = await supabase
        .from('documents')
        .select(`
          doc_id,
          file_name,
          file_url,
          file_size_bytes,
          file_type,
          upload_timestamp,
          Users ( first_name, last_name )
        `)
        .eq('trip_id', tripId)
        .order('upload_timestamp', { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        return; 
      }

      if (docs) {
        const formattedDocs = docs.map((doc) => ({
          id: doc.doc_id,
          title: doc.file_name,
          url: doc.file_url,
          size: doc.file_size_bytes ? doc.file_size_bytes : 'Unknown Size',
          file_type: doc.file_type,
          date: new Date(doc.upload_timestamp).toLocaleDateString(),
          uploader: doc.Users ? `${doc.Users.first_name} ${doc.Users.last_name}` : 'Unknown'
        }));
        
        setDocuments(formattedDocs);
      }
    } catch (err) {
      console.error("Unexpected network/execution error:", err);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [tripId]);

  const handleRefresh = async () => {
    if (refreshTripData) await refreshTripData();
    await fetchDocuments();
  };

  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true, 
      });

      if (result.canceled) {
        setModalVisible(false);
        return;
      }

      setModalVisible(false);
      setIsLoading(true);

      const file = result.assets[0];
      const TEMP_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; 

      const fileExt = file.name.split('.').pop();
      const fileName = file.name.replace(`.${fileExt}`, '');
      const filePath = `${tripId}/${fileName}-${Date.now()}.${fileExt}`;

      const localFile = new File(file.uri);
      const arrayBuffer = await localFile.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('trip-documents')
        .upload(filePath, arrayBuffer, { 
          contentType: file.mimeType || 'application/octet-stream' 
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('trip-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          trip_id: tripId,
          uploader_id: TEMP_USER_ID,
          file_name: file.name,
          file_url: publicUrlData.publicUrl,
          file_size_bytes: file.size,
          file_type: fileExt.toLowerCase(),
        });

      if (dbError) throw dbError;

      await fetchDocuments();

    } catch (error) {
      console.error("Error uploading document:", error);
      alert("There was an issue uploading your document.");
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Added handler to process and upload files selected from the device Camera or Gallery
  const handleImageUpload = async (mediaFunction) => {
    try {
      const uri = await mediaFunction();
      if (!uri) return; 

      setModalVisible(false);
      setIsLoading(true);

      const TEMP_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; 
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `Photo_${Date.now()}`;
      const filePath = `${tripId}/${fileName}.${fileExt}`;

      const localFile = new File(uri);
      const arrayBuffer = await localFile.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('trip-documents')
        .upload(filePath, arrayBuffer, { 
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` 
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('trip-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          trip_id: tripId,
          uploader_id: TEMP_USER_ID,
          file_name: `${fileName}.${fileExt}`,
          file_url: publicUrlData.publicUrl,
          file_size_bytes: 0, 
          file_type: fileExt.toLowerCase(),
        });

      if (dbError) throw dbError;

      await fetchDocuments();

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("There was an issue uploading your image.");
    } finally {
      setIsLoading(false);
    }
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

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : documents.length === 0 ? (
        <TouchableOpacity style={styles.uploadContainer} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="cloud-upload" size={moderateScale(24)} color={Colors.gray} />
          <Text style={styles.uploadText}>Tap to upload PDF or Image</Text>
        </TouchableOpacity>  
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

// ... styles block remains identical

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