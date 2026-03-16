import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

export default function ReliveStoryViewer({ trip, onClose }) {
    // 1. Flatten the data into slides
    const slides = [
        { type: 'intro', image: trip.image, title: trip.name, subtitle: 'The Recap' },
        // Map through memories
        ...trip.memories.map(mem => ({
            type: 'memory',
            image: mem.images[0], // Assuming these are resolved image URIs/requires
            title: mem.title,
            subtitle: mem.description,
            date: mem.date
        }))
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const currentSlide = slides[activeIndex];

    // 2. Handle Navigation
    const handleNext = () => {
        if (activeIndex === slides.length - 1) {
            onClose(); // End of story, go back to Past Trips page
        } else {
            setActiveIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (activeIndex === 0) {
            // Do nothing, or close
        } else {
            setActiveIndex(prev => prev - 1);
        }
    };

    return (
        <View style={styles.container}>
            {/* --- THE BACKGROUND IMAGE --- */}
            <Image 
                source={currentSlide.image} 
                style={styles.backgroundImage} 
                contentFit="cover"
            />

            {/* Dark gradient at the bottom so text is readable */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.bottomGradient}
            />

            {/* --- THE PROGRESS BARS (IG Style) --- */}
            <View style={styles.progressContainer}>
                {slides.map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.progressBar, 
                            { backgroundColor: index <= activeIndex ? 'white' : 'rgba(255,255,255,0.3)' }
                        ]} 
                    />
                ))}
            </View>

            {/* --- THE INVISIBLE TOUCH ZONES --- */}
            <View style={styles.touchZones}>
                <Pressable style={styles.leftZone} onPress={handlePrev} />
                <Pressable style={styles.rightZone} onPress={handleNext} />
            </View>

            {/* --- THE CONTENT (Text overlay) --- */}
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{currentSlide.title}</Text>
                <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
                {currentSlide.date && <Text style={styles.date}>{currentSlide.date}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    backgroundImage: { ...StyleSheet.absoluteFillObject },
    bottomGradient: {
        position: 'absolute',
        bottom: 0, width: '100%', height: height * 0.4,
    },
    touchZones: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        zIndex: 10, // Must be above the image, but below the top progress bars
    },
    leftZone: { width: '30%', height: '100%' },
    rightZone: { width: '70%', height: '100%' },
    progressContainer: {
        flexDirection: 'row',
        paddingTop: 50, // Safe area for notch
        paddingHorizontal: 10,
        gap: 4,
        zIndex: 20,
    },
    progressBar: {
        flex: 1, height: 3, borderRadius: 2,
    },
    contentContainer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        zIndex: 20,
        pointerEvents: 'none', // Lets touches pass through to the invisible zones
    },
    title: { color: 'white', fontSize: moderateScale(32), fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: 'white', fontSize: moderateScale(16), lineHeight: 22 },
    date: { color: '#cbd5e1', fontSize: moderateScale(14), marginTop: 8, fontWeight: '600' }
});