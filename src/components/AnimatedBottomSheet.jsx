import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnimatedBottomSheet({ visible, onClose, children }) {
  // We use this internal state to keep the Modal mounted WHILE the close animation runs
  const [renderModal, setRenderModal] = useState(visible);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Best Practice: Use SCREEN_HEIGHT instead of 300. 
  // If your sheet content grows taller than 300px, it would peek out the bottom when "closed"!
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; 

  useEffect(() => {
    if (visible) {
      // 1. Mount the modal first
      setRenderModal(true);
      // 2. Animate it in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();
    } else {
      // 1. Animate it out first
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true })
      ]).start(() => {
        // 2. ONLY unmount the modal after the animation completely finishes
        setRenderModal(false);
      });
    }
  }, [visible]);

  if (!renderModal) return null;

  return (
    <Modal animationType="none" transparent={true} visible={renderModal}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          
          {/* Backdrop (Tap to close) */}
          {/* activeOpacity={1} prevents the dark background from flashing when tapped */}
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
          {/* The Sheet Content */}
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            {children}
          </Animated.View>

        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    paddingBottom: moderateScale(40), 
  },
});