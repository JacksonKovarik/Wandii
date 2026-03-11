import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; 

export default function DeckSwiper({ data, renderItem, onSwipeLeft, onSwipeRight }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useSharedValue(0);
    const isAnimating = useSharedValue(false);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleSwipeComplete = (direction) => {
        const item = data[currentIndex];
        if (direction === 'right' && onSwipeRight) onSwipeRight(item);
        if (direction === 'left' && onSwipeLeft) onSwipeLeft(item);
        
        setCurrentIndex((prev) => prev + 1);
    };

    const triggerSwipe = (direction) => {
        if (isAnimating.value) return; 
        
        isAnimating.value = true;
        triggerHaptic();
        
        const isRight = direction === 'right';
        const moveX = isRight ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        
        translateX.value = withSpring(
            moveX,
            { velocity: isRight ? 800 : -800 },
            (finished) => { 
                if (finished) {
                    runOnJS(handleSwipeComplete)(direction);
                }
            }
        );
    };

    // --- CARD ANIMATION STYLES ---
    const topCardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-10, 0, 10] 
        );
        return {
            transform: [
                { translateX: translateX.value },
                { rotate: `${rotate}deg` },
                { scale: 1 },
            ],
        };
    });

    const nextCardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [1, 0.95, 1], 
            'clamp' 
        );
        return {
            transform: [{ scale }],
        };
    });

    // --- NEW: WATERMARK STAMP ANIMATIONS ---
    
    // LIKE Stamp (appears on the top-left when dragging right)
    const likeStampStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SCREEN_WIDTH / 5], // Fades in quickly
            [0, 1],
            'clamp'
        );
        // Starts 20% larger and scales down to normal size, mimicking a rubber stamp hitting the card
        const scale = interpolate(
            translateX.value,
            [0, SCREEN_WIDTH / 5],
            [1.2, 1],
            'clamp'
        );
        
        return { 
            opacity,
            transform: [
                { rotate: '-15deg' }, // Tilted counter-clockwise
                { scale }
            ]
        };
    });

    // NOPE Stamp (appears on the top-right when dragging left)
    const nopeStampStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, -SCREEN_WIDTH / 5], 
            [0, 1],
            'clamp'
        );
        const scale = interpolate(
            translateX.value,
            [0, -SCREEN_WIDTH / 5],
            [1.2, 1],
            'clamp'
        );
        
        return { 
            opacity,
            transform: [
                { rotate: '15deg' }, // Tilted clockwise
                { scale }
            ]
        };
    });

    useEffect(() => {
        translateX.value = 0;
        isAnimating.value = false;
    }, [currentIndex]);

    return (
        <View style={styles.container}>
            {data.map((item, index) => {
                if (index < currentIndex) return null;

                const isTopCard = index === currentIndex;
                const isNextCard = index === currentIndex + 1;

                const panGesture = Gesture.Pan()
                .enabled(isTopCard) 
                .activeOffsetX([-15, 15]) 
                .onChange((event) => {
                    if (isAnimating.value) return; 
                    translateX.value = event.translationX;
                })
                .onEnd((event) => {
                    if (isAnimating.value) return;
                    if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                        isAnimating.value = true;
                        
                        runOnJS(triggerHaptic)(); 
                        const direction = event.translationX > 0 ? 1 : -1;
                        translateX.value = withSpring(
                            direction * SCREEN_WIDTH * 1.5,
                            { velocity: event.velocityX },
                            (finished) => {
                                if (finished) {
                                    runOnJS(handleSwipeComplete)(direction === 1 ? 'right' : 'left');
                                }
                            }
                        );
                    } else {
                        translateX.value = withSpring(0);
                    }
                });

                return (
                    <GestureDetector key={item.id} gesture={panGesture}>
                        <Animated.View
                        style={[
                            styles.card,
                            { zIndex: data.length - index },
                            isTopCard ? topCardStyle : isNextCard ? nextCardStyle : { transform: [{ scale: 0.95 }] }
                        ]}
                        >
                            {/* The actual Idea Card UI */}
                            {renderItem({ 
                                item, 
                                index, 
                                swipeLeft: () => triggerSwipe('left'), 
                                swipeRight: () => triggerSwipe('right') 
                            })}

                            {/* --- NEW: THE STAMP OVERLAYS --- */}
                            {isTopCard && (
                                <>
                                    {/* LIKE Stamp */}
                                    <Animated.View style={[styles.stampContainer, styles.likeStamp, likeStampStyle]}>
                                        <Text style={styles.likeText}>LIKE</Text>
                                    </Animated.View>

                                    {/* NOPE Stamp */}
                                    <Animated.View style={[styles.stampContainer, styles.nopeStamp, nopeStampStyle]}>
                                        <Text style={styles.nopeText}>NOPE</Text>
                                    </Animated.View>
                                </>
                            )}
                        </Animated.View>
                    </GestureDetector>
                );
            }).reverse()} 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 360, 
        width: '100%',
    },
    card: {
        position: 'absolute', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    
    // --- STAMP STYLES ---
    stampContainer: {
        position: 'absolute',
        top: 50,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slight frosted background so it pops over images
    },
    likeStamp: {
        left: 30,
        borderColor: '#10b981', // Emerald green
    },
    nopeStamp: {
        right: 30,
        borderColor: '#ef4444', // Red
    },
    likeText: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#10b981',
        textTransform: 'uppercase',
    },
    nopeText: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#ef4444',
        textTransform: 'uppercase',
    }
});