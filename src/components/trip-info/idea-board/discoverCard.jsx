import { Colors } from "@/src/constants/colors";
import { getCategoryFallback } from "@/src/constants/TripConstants";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const DiscoverCard = ({ item, swipeLeft, swipeRight }) => {
  const fallback = getCategoryFallback(item.category);

  return (
    <View style={styles.discoverCardContainer}>
      <View style={styles.discoverCardContent}>
        {item.image_url ? (
          <Image 
            source={item.image_url} 
            style={styles.discoverCardImage}
            contentFit="cover" 
            transition={200} 
            cachePolicy="memory-disk" 
          />
        ) : (
          <LinearGradient colors={fallback.colors} style={styles.fallbackGradient}>
            <MaterialIcons name={fallback.icon} size={80} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        )}
        
        <View style={styles.discoverCardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.description}</Text>
          
          <View style={styles.swipeActionRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.danger }]} onPress={swipeLeft} hitSlop={5}>
              <MaterialIcons name="close" size={moderateScale(20)} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.success }]} onPress={swipeRight} hitSlop={5}>
              <MaterialIcons name="check" size={moderateScale(20)} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    swiperWrapper: { minHeight: 360, justifyContent: 'center', width: '100%' },
    discoverCardContainer: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: moderateScale(20), width: '100%', backgroundColor: 'white', borderRadius: 20 },
    discoverCardContent: { borderRadius: 20, overflow: 'hidden', width: '100%', backgroundColor: 'white' },
    discoverCardImage: { width: '100%', height: 180 },
    fallbackGradient: { width: '100%', height: 180, alignItems: 'center', justifyContent: 'center' },
    discoverCardInfo: { padding: 15, justifyContent: 'center' },
    swipeActionRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: moderateScale(10) },
    actionButton: { padding: 12, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: moderateScale(16), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(2) },
    cardSubtitle: { fontSize: moderateScale(13), color: Colors.gray },
});