import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from "react";
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

const styles = StyleSheet.create({
    documentCard: { flexDirection: 'row', backgroundColor: 'white', padding: moderateScale(12), borderRadius: moderateScale(12), marginBottom: moderateScale(12), gap: moderateScale(12) },
    documentIconPlaceholder: { width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(8), backgroundColor: Colors.lightGray },
    documentTitle: { fontSize: moderateScale(15), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(4) },
    documentMetaRow: { flexDirection: 'row', alignItems: 'center' },
    documentMetaText: { fontSize: moderateScale(12), color: Colors.gray },
    documentMetaDot: { fontSize: moderateScale(14), color: Colors.gray, marginHorizontal: moderateScale(6), marginTop: moderateScale(-2) },
    downloadBtn: { padding: moderateScale(8), justifyContent: 'center' },
});

export default DocumentCard;