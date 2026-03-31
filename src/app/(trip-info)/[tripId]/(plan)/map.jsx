import ReusableTabBar from "@/src/components/reusableTabBar";
import { TripContext } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native"; // 1. Import this!
import { BlurView } from "expo-blur";
import * as Location from 'expo-location';
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { moderateScale } from "react-native-size-matters";

export default function Map() {
    const { tripId } = useLocalSearchParams();
    const { staysData, timelineData } = useContext(TripContext);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const mapRef = useRef(null);
    
    // 2. Initialize the hook
    const isFocused = useIsFocused(); 

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setHasLocationPermission(true);
            }
        })();
    }, []);

    const allEvents = Object.values(timelineData || {}).flat();
    const allCoordinates = [...(staysData || []), ...allEvents]
        .map(item => item.coordinate)
        .filter(coord => coord !== undefined);

    const focusMap = () => {
        if (!mapRef.current || allCoordinates.length === 0) return;

        if (allCoordinates.length === 1) {
            // THE FIX: If there's only 1 marker, use animateToRegion with a fixed zoom
            mapRef.current.animateToRegion({
                latitude: allCoordinates[0].latitude,
                longitude: allCoordinates[0].longitude,
                latitudeDelta: 0.05, // Controls vertical zoom (0.05 is roughly city-level)
                longitudeDelta: 0.05, // Controls horizontal zoom
            }, 1000); // 1000ms animation duration
        } else {
            // 2 or more markers? Fit them all perfectly
            mapRef.current.fitToCoordinates(allCoordinates, {
                edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
                animated: true,
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BlurView intensity={40} style={{ borderRadius: 15, overflow: 'hidden', marginTop: 10}}>
                    <ReusableTabBar 
                        tabs={[
                            { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripId}/(plan)/idea-board` },
                            { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripId}/(plan)/timeline` },
                            { label: "Map", name: "map", route: `/(trip-info)/${tripId}/(plan)/map` },
                            { label: "Stays", name: "stays", route: `/(trip-info)/${tripId}/(plan)/stays` },
                        ]}
                        extraBgStyles={{ backgroundColor: 'rgba(39, 39, 39, 0.5)', marginTop: 0}}
                        extraTextStyles={{ color: 'rgb(219, 219, 219)' }}
                    />
                </BlurView>
            </View>

            {/* 3. The Killswitch: Only render the map if the screen is focused */}
            {isFocused ? (
                <MapView 
                    ref={mapRef}
                    style={styles.map} 
                    showsUserLocation={hasLocationPermission}
                    showsMyLocationButton={true}
                    minZoomLevel={4}
                    onMapReady={focusMap}

                    // provider="google" // Optional: Uncomment if you want to force Google Maps on iOS
                    
                    pitchEnabled={false}      // Stops the 3D angle tilt
                    showsBuildings={false}    // Prevents rendering 3D building polygons
                    showsTraffic={false}      // Stops live traffic data polling
                    showsIndoors={false}      // Stops loading indoor mall/airport floor plans
                    showsCompass={false}      // Removes the extra compass UI overlay
                >
                    {staysData?.map((stay) => {
                        if (!stay.coordinate) return null;
                        return (
                            <Marker 
                                key={`stay-${stay.id}`}
                                coordinate={stay.coordinate}
                                title={stay.name}
                                description={stay.address}
                                tracksViewChanges={false} 
                            >
                                <View style={[styles.customMarker, { backgroundColor: '#4F46E5' }]}>
                                    <MaterialIcons name="hotel" size={moderateScale(16)} color="white" />
                                </View>
                            </Marker>
                        )
                    })}

                    {allEvents.map((event) => {
                        if (!event.coordinate) return null; 
                        return (
                            <Marker 
                                key={`event-${event.id}`}
                                coordinate={event.coordinate}
                                title={event.title}
                                description={event.time}
                                tracksViewChanges={false}
                            >
                                <View style={[styles.customMarker, { backgroundColor: '#E11D48' }]}>
                                    <MaterialIcons name="place" size={moderateScale(16)} color="white" />
                                </View>
                            </Marker>
                        )
                    })}
                </MapView>
            ) : (
                // 4. Render an empty view to completely clear the native memory when leaving the tab
                <View style={styles.map} /> 
            )}
        </View>
    );
}

// ... styles remain the same

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff'
    },
    header: {
        padding: 10,
        width: '100%', 
        alignItems: 'center',
        zIndex: 10, 
        // backgroundColor: 'rgba(255,255,255,0.9)',
        position: 'absolute', // Allows the map to slide under the slightly transparent header
        top: 0
    },
    map: {
        flex: 1, 
        width: '100%',
    },
    customMarker: {
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});