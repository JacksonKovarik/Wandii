import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

export const RefreshBar = ({ isRefreshing }) => {
    const progress = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        if (isRefreshing) {
            // Fade in and start the loop
            opacity.setValue(1);
            progress.setValue(0);

            // Start an indeterminate loading animation
            Animated.loop(
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            ).start();
        } else {
            // When not refreshing, stop the loop, animate to full width, then fade out
            progress.stopAnimation(() => {
                Animated.sequence([
                    Animated.timing(progress, {
                        toValue: 1,
                        duration: 200, // Quickly fill the bar
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200, // Fade out
                        useNativeDriver: false,
                    }),
                    
                ]).start(() => {
                    progress.setValue(0); // Reset for next time
                });
            });
        }
    }, [isRefreshing, progress, opacity]);

    const animatedWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <Animated.View style={[styles.container, { opacity: opacity}]}>
            <Animated.View style={[styles.progressBar, { width: animatedWidth }]} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 4,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary
    }
});