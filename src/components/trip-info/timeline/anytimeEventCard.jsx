import { Colors } from "@/src/constants/colors";
import { getCategoryFallback } from "@/src/constants/TripConstants";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useIsActive, useReorderableDrag } from "react-native-reorderable-list";


const AnytimeEventCard = ({ item, onSetTime, onRemove }) => {
    const drag = useReorderableDrag();
    const isActive = useIsActive();
    const fallback = getCategoryFallback(item.category);

    return (
        <Pressable 
            onLongPress={drag}
            delayLongPress={150}
            style={[styles.itemContainer, isActive && { opacity: 0.7, transform: [{ scale: 1.02 }] }]}
        >
            <View style={[styles.contentContainer, { paddingLeft: 0, width: '100%' }]}>
                <View style={[styles.card, isActive && styles.cardActive]}>    
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardMainInfo}>
                            <View style={[styles.cardImageContainer, styles.anytimeCardImageContainer]}>
                                {item.image_url ? (
                                    <Image source={item.image_url} style={styles.fullImage} contentFit="cover" />
                                ) : (
                                    <LinearGradient colors={fallback.colors} style={styles.fallbackGradient}>
                                        <MaterialIcons name={fallback.icon} size={24} color="rgba(255,255,255,0.9)" />
                                    </LinearGradient>
                                )}
                            </View>
                            <View style={styles.cardTextContent}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.cardActions}>
                            <TouchableOpacity style={styles.setTimeButton} onPress={() => onSetTime(item.id)}>
                                <Text style={styles.setTimeText}>Set Time</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item)}>
                                <MaterialIcons name="close" size={16} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    itemContainer: { flexDirection: 'row', paddingHorizontal: '5%', marginBottom: 10 },
    contentContainer: { flex: 1, paddingLeft: 10 },
    
    // --- CARDS ---
    card: { backgroundColor: 'white', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    cardActive: { shadowOpacity: 0.3, elevation: 8, borderColor: Colors.primary, borderWidth: 1 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cardMainInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    cardTextContent: { flex: 1, paddingRight: 10 },
    cardImageContainer: { width: 80, height: '100%', borderRadius: 10, backgroundColor: Colors.lightGray, overflow: 'hidden' },
    anytimeCardImageContainer: { width: 65, height: 65, marginRight: 12 },
    cardActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
    
    fullImage: { width: '100%', height: '100%' },
    fallbackGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    
    // --- TYPOGRAPHY & BADGES ---
    title: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    category: { color: '#64748b', fontSize: 13, fontWeight: '500' },
        
    // --- BUTTONS ---
    setTimeButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    setTimeText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
    removeButton: { padding: 4, backgroundColor: '#f8fafc', borderRadius: 12 },
});

export default AnytimeEventCard;