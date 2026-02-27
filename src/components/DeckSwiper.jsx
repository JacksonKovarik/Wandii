import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
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
        
        isAnimating.value = true; // <-- CRITICAL: Lock the animation!
        triggerHaptic();
        
        const isRight = direction === 'right';
        const moveX = isRight ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        
        translateX.value = withSpring(
            moveX,
            { velocity: isRight ? 800 : -800 },
            (finished) => { // <-- CRITICAL: Check if it actually finished
                if (finished) {
                    runOnJS(handleSwipeComplete)(direction);
                }
            }
        );
    };

    const topCardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-15, 0, 15] 
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
            [1, 0.9, 1], 
            'clamp' 
        );
        return {
            transform: [{ scale }],
        };
    });

    useEffect(() => {
        translateX.value = 0;
        isAnimating.value = false;
    }, [currentIndex])

    return (
        <View style={styles.container}>
            {data.map((item, index) => {
                if (index < currentIndex) return null;

                const isTopCard = index === currentIndex;
                const isNextCard = index === currentIndex + 1;

                const panGesture = Gesture.Pan()
                .enabled(isTopCard) 
                .activeOffsetX([-15, 15]) // 1. CRITICAL: Require 15px of horizontal movement before activating
                .onChange((event) => {
                    if (isAnimating.value) return; // 2. CRITICAL: Ignore touches if it's mid-flight
                    translateX.value = event.translationX;
                })
                .onEnd((event) => {
                    if (isAnimating.value) return;
                    // ... (keep your existing onEnd logic here)
                    if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                        isAnimating.value = true;
                        
                        runOnJS(triggerHaptic)(); // Trigger haptic feedback on swipe
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
                            isTopCard ? topCardStyle : isNextCard ? nextCardStyle : { transform: [{ scale: 0.9 }] }
                        ]}
                        >
                            {renderItem({ 
                                item, 
                                index, 
                                swipeLeft: () => triggerSwipe('left'), 
                                swipeRight: () => triggerSwipe('right') 
                            })}
                        </Animated.View>
                    </GestureDetector>
                );
            }).reverse()} 
            
            {/* {currentIndex >= data.length && (
                <Text style={styles.emptyText}>No more cards!</Text>
            )} */}
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
    emptyText: {
        fontSize: 20,
        color: '#64748b',
    },
});