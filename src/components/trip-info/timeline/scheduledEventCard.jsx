import { Colors } from '@/src/constants/colors';
import { getCategoryFallback } from '@/src/constants/TripConstants';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from 'react-native-size-matters';


const ScheduledEventCard = ({ item, isLast, onSetTime, onRemove, onDelete, onViewDetails }) => {
    const [isVisuallyPressed, setVisuallyPressed] = useState(false);
    const pressInTimer = useRef(null);
    const PRESS_DELAY = 200; 

    const handleLongPress = () => {
        Alert.alert(
            "Manage Event",
            `What would you like to do with "${item.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Unassign (Back to Bank)", onPress: () => onRemove(item) },
                { text: "Delete Permanently", style: "destructive", onPress: () => onDelete(item) }
            ],
            { cancelable: true } 
        );
    };

    const handlePressIn = () => {
        pressInTimer.current = setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setVisuallyPressed(true);
        }, PRESS_DELAY);
    };

    const handlePressOut = () => {
        clearTimeout(pressInTimer.current);
        setVisuallyPressed(false);
    };

    return (
        <View style={styles.itemContainer}>
            <View style={styles.timelineContainer}>
                <View style={[styles.line, isLast && styles.lastLine]} />
                <View style={[styles.dot]} />
            </View>

            <View style={styles.contentContainer}>
                <Pressable 
                    onPress={() => onViewDetails(item)}
                    onLongPress={handleLongPress}
                    delayLongPress={250} 
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.contentContainer, 
                        isVisuallyPressed && { opacity: 0.8, transform: [{ scale: 1.03 }] }
                    ]}
                >
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardTextContent}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity style={styles.timeBadge} onPress={() => onSetTime(item.id)}>
                                        <Text style={styles.timeText}>{item.time}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                            
                            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                <View style={styles.cardImageContainer}>
                                    {item.image_url ? (
                                        <Image source={item.image_url} style={styles.fullImage} contentFit="cover" />
                                    ) : (
                                        <LinearGradient colors={getCategoryFallback(item.category).colors} style={styles.fallbackGradient}>
                                            <MaterialIcons name={getCategoryFallback(item.category).icon} size={24} color="rgba(255,255,255,0.9)" />
                                        </LinearGradient>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: { flexDirection: 'row', paddingHorizontal: '5%', marginBottom: 10 },
    contentContainer: { flex: 1, paddingLeft: 10 },
    timelineContainer: { width: 30, alignItems: 'center' },
    timeBadge: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 10 },
    timeText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
    line: { width: 2, backgroundColor: '#D3D3D3', position: 'absolute', top: 0, bottom: -10 },
    lastLine: { bottom: '50%' },
    dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary, marginTop: moderateScale(42), zIndex: 1 },
    
    // --- CARDS ---
    card: { backgroundColor: 'white', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cardTextContent: { flex: 1, paddingRight: 10 },
    cardImageContainer: { width: 80, height: '100%', borderRadius: 10, backgroundColor: Colors.lightGray, overflow: 'hidden' },

    
    fullImage: { width: '100%', height: '100%' },
    fallbackGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    
    // --- TYPOGRAPHY & BADGES ---
    title: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    category: { color: '#64748b', fontSize: 13, fontWeight: '500' },
});

export default ScheduledEventCard;