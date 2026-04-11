import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
const { height } = Dimensions.get('window');

export default function TripStoryScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animations
  const imageScale = useRef(new Animated.Value(1)).current;
  const uiOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchStoryData();
  }, [tripId]);

  // The "Ken Burns" Slow Zoom Effect
  useEffect(() => {
    if (!isLoading && stories.length > 0) {
      // Reset scale when index changes
      imageScale.setValue(1);
      // Start the slow zoom
      Animated.timing(imageScale, {
        toValue: 1.15,
        duration: 18000, 
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex, isLoading, stories]);

  const fetchStoryData = async () => {
    if (!tripId) return;

    try {
      const [tripRes, journalsRes, photosRes] = await Promise.all([
        supabase.from('Trips').select('cover_photo_url').eq('trip_id', tripId).single(),
        supabase.from('Journals').select('*').eq('trip_id', tripId).order('entry_timestamp', { ascending: true }),
        supabase.from('Photos').select('*').eq('trip_id', tripId)
      ]);

      const journals = journalsRes.data || [];
      const photos = photosRes.data || [];
      const fallbackCover = tripRes.data?.cover_photo_url || FALLBACK_IMAGE;
      const unlinkedPhotos = photos.filter(p => !p.entry_id);

      const mergedStories = journals.map((journal) => {
        let imageUrl = fallbackCover;
        const linkedPhoto = photos.find(p => p.entry_id === journal.entry_id);

        if (linkedPhoto) {
          imageUrl = linkedPhoto.photo_url;
        } else if (unlinkedPhotos.length > 0) {
          const randomIndex = Math.floor(Math.random() * unlinkedPhotos.length);
          imageUrl = unlinkedPhotos[randomIndex].photo_url;
        }

        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = journal.entry_timestamp 
            ? new Date(journal.entry_timestamp).toLocaleDateString('en-US', dateOptions)
            : '';

        return {
          id: journal.entry_id,
          title: journal.title,
          description: journal.description,
          date: formattedDate,
          image_url: imageUrl,
        };
      });

      setStories(mergedStories);
    } catch (error) {
      console.error("Error fetching story data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
    else router.back(); 
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // Hold to Hide UI Functions
  const hideUI = () => {
    Animated.timing(uiOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };
  const showUI = () => {
    Animated.timing(uiOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (stories.length === 0) return null; 

  const currentStory = stories[currentIndex];

  return (
    <View style={styles.container}>
      
      {/* 1. Animated Background View (Fixes the zoom issue!) */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ scale: imageScale }] }]}>
        <Image 
          source={{ uri: currentStory?.image_url }} 
          style={StyleSheet.absoluteFillObject} 
          contentFit="cover" 
          cachePolicy="memory-disk"
        />
      </Animated.View>

      {/* 2. Immersive Tap Zones (Placed UNDER the UI layer so they don't block buttons) */}
      <View style={styles.tapZones}>
        <Pressable 
            style={{ flex: 0.3 }} 
            onPress={handlePrevious} 
            onLongPress={hideUI} 
            delayLongPress={250}
            onPressOut={showUI}
        />
        <Pressable 
            style={{ flex: 0.7 }} 
            onPress={handleNext} 
            onLongPress={hideUI} 
            delayLongPress={250}
            onPressOut={showUI}
        />
      </View>
      
      {/* 3. UI Layer (pointerEvents="box-none" ensures only the buttons catch taps) */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: uiOpacity, zIndex: 100 }]} pointerEvents="box-none">
        
        {/* Warm Linear Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(25, 12, 8, 0.6)', 'rgba(20, 10, 5, 0.98)']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Text Container */}
        <View style={styles.textContainer} pointerEvents="none">
          {currentStory?.date ? (
            <Text style={styles.dateText}>{currentStory.date}</Text>
          ) : null}
          <Text style={styles.title}>{currentStory?.title}</Text>
          <Text style={styles.description}>{currentStory?.description}</Text>
        </View>

        {/* Subtle Floating Exit Button (Fixed Height and Clickability!) */}
        <TouchableOpacity onPress={() => router.back()} style={styles.floatingClose} activeOpacity={0.7}>
          <View style={styles.closeBlur}>
            <Ionicons name="close" size={24} color="white" />
          </View>
        </TouchableOpacity>

      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.55, 
  },
  
  // Minimalist Floating Exit - Hardcoded top value to safely clear the iPhone Dynamic Island
  floatingClose: {
    position: 'absolute',
    top: 55, // Increased to push it down below the notch/island
    right: scale(20),
    zIndex: 999, // Guarantees it is the top-most interactive element
    elevation: 10,
  },
  closeBlur: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: scale(6),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  tapZones: { 
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', 
    zIndex: 50 
  },

  textContainer: { 
    position: 'absolute', 
    bottom: verticalScale(50), 
    left: scale(24), 
    right: scale(24),
  },
  dateText: {
    color: '#FFB97A', 
    fontSize: moderateScale(13),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: verticalScale(8),
  },
  title: { 
    color: '#FFF8F0', 
    fontSize: moderateScale(32), 
    fontWeight: '800', 
    marginBottom: verticalScale(12), 
    letterSpacing: -0.5,
  },
  description: { 
    color: 'rgba(255,248,240,0.85)', 
    fontSize: moderateScale(16), 
    lineHeight: moderateScale(24), 
    fontWeight: '400', 
  },
});