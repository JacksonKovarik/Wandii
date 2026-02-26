import { RefreshBar } from "@/src/components/refreshBar";
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

export default function TripInfoScrollView({ 
  onRefresh, // The function to run when the user pulls to refresh
  children,  // The content inside the ScrollView
  style,     // Any styles passed to the container
  ...props   // Any extra ScrollView props (like contentContainerStyle)
}) {
  const [refreshing, setRefreshing] = useState(false);
  const hapticFired = useRef(false); 
  const isDragging = useRef(false);

  // Wrapper to handle the loading state automatically
  const handleRefresh = useCallback(async () => {
    setRefreshing(true); 
    try {
      await onRefresh(); 
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const handleScrollBeginDrag = (event) => {
    isDragging.current = true;
    // Pass the event up if the parent provided its own onScrollBeginDrag
    if (props.onScrollBeginDrag) props.onScrollBeginDrag(event);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    if (isDragging.current && offsetY <= -60 && !refreshing && !hapticFired.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
      hapticFired.current = true; 
    }
    
    if (offsetY > -60 && hapticFired.current) {
      hapticFired.current = false;
    }

    if (props.onScroll) props.onScroll(event);
  };

  const handleScrollEndDrag = (event) => {
    isDragging.current = false; 
    
    const offsetY = event.nativeEvent.contentOffset.y;
    
    if (offsetY <= -60 && !refreshing) {
      handleRefresh(); 
    }
    
    hapticFired.current = false;
    if (props.onScrollEndDrag) props.onScrollEndDrag(event);
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <RefreshBar isRefreshing={refreshing} />
      <ScrollView 
        {...props}
        onScrollBeginDrag={handleScrollBeginDrag} 
        onScroll={handleScroll}             
        scrollEventThrottle={16}            
        onScrollEndDrag={handleScrollEndDrag}
      >
        {children}
      </ScrollView>
    </View>
  );
}