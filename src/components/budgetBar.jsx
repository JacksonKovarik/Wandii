import Slider from "@react-native-community/slider";
import React, { useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function BudgetBar({ value, onChange }) {
  const animatedValue = useRef(new Animated.Value(value)).current;
  const [sliderWidth, setSliderWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState([0, 0, 0, 0]);

  const INSET = 18;
  const THUMB_SIZE = 20;

  const handleSnap = (v) => {
    Animated.timing(animatedValue, {
      toValue: v,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
    onChange(v);
  };

  const getLabelX = (i) => {
    if (!sliderWidth) return 0;
    const trackWidth = sliderWidth - THUMB_SIZE;
    const thumbCenter = INSET + (trackWidth * (i / 3)) + THUMB_SIZE / 2;
    return thumbCenter - labelWidths[i] / 2;
  };

  const handleLabelLayout = (i, e) => {
    const w = e.nativeEvent.layout.width;
    setLabelWidths((prev) => {
      const copy = [...prev];
      copy[i] = w;
      return copy;
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.sliderWrapper, { paddingHorizontal: INSET }]}>
        <View
          style={{ width: "100%" }}
          onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        >
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={3}
            step={1}
            value={value}
            onValueChange={onChange}
            onSlidingComplete={handleSnap}
            minimumTrackTintColor="#ffe8cc"
            maximumTrackTintColor="#ebebeb"
            thumbTintColor="#ff8820"
            thumbStyle={{ transform: [{ scale: THUMB_SIZE / 24 }] }}
          />
        </View>
      </View>

      <View style={[styles.labelRow, { paddingHorizontal: INSET }]}>
        {["$", "$$", "$$$", "$$$$"].map((label, i) => (
          <Animated.Text
            key={i}
            style={[styles.label, { left: getLabelX(i) }]}
            onLayout={(e) => handleLabelLayout(i, e)}
          >
            {label}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: verticalScale(20),
  },
  sliderWrapper: {
    width: "100%",
  },
  slider: {
    width: "100%",
    height: verticalScale(40),
  },
  labelRow: {
    width: "100%",
    height: verticalScale(20),
    marginTop: verticalScale(10),
    position: "relative",
  },
  label: {
    position: "absolute",
    fontSize: moderateScale(14),
    color: "#9d9d9d",
    fontWeight: "600",
  },
});


































