import { Colors } from "@/src/constants/colors";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const { documents = [] } = useTrip();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Trip Journal Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
        <Text style={styles.sectionTitle}>Travel Documents</Text>
        <TouchableOpacity style={{ flexDirection: 'row', gap: 5 }}onPress={() => console.log('New doc pressed')}>
          <MaterialIcons name="upload" size={moderateScale(18)} color={Colors.primary} />
          <Text style={styles.newEntryButton}>Upload</Text>
        </TouchableOpacity>
        
      </View>
      {documents.map((doc) => (
        <DocumentCard key={doc.id} title={doc.title} date={doc.date} size={doc.size} />
      ))}

      {/* This TouchableOpacity replaces the View to make it interactive */}
      <TouchableOpacity style={styles.uploadContainer} onPress={() => console.log('Upload area tapped')}>
        {/* For more control over dash spacing, you might use a library like 'react-native-dash' here instead of the borderStyle property. */}
        <MaterialIcons name="cloud-upload" size={moderateScale(24)} color={Colors.gray} />
        <Text style={styles.uploadText}>Tap to upload PDF or Image</Text>
      </TouchableOpacity>
    </ScrollView>
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
});