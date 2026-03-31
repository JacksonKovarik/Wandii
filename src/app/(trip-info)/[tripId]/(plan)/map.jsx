import ReusableTabBar from "@/src/components/reusableTabBar";
import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { moderateScale } from "react-native-size-matters";

export default function Map() {
    // 1. Standardized Context Usage
    const { tripId, timelineData } = useTrip();
    
    const [staysData, setStaysData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    
    const mapRef = useRef(null);
    const isFocused = useIsFocused(); 

    // 2. Initial Setup & Data Fetching
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setHasLocationPermission(true);
            }
        })();

        fetchStays();
    }, [tripId]);

    const fetchStays = async () => {
        if (!tripId) return;
        try {
            const { data, error } = await supabase
                .from('Accommodations')
                .select('accommodation_id, title, latitude, longitude')
                .eq('trip_id', tripId)
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            if (error) throw error;
            setStaysData(data || []);
        } catch (err) {
            console.error("Map fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Process the Events
    // Flatten the dictionary and filter for events that have a specific time and valid coordinates
    const allEvents = Object.values(timelineData || {}).flat();
    const scheduledEvents = allEvents.filter(event => 
        event.time && 
        event.time !== 'TBD' && 
        event.time !== 'All Day' && 
        event.latitude && 
        event.longitude
    );

    // 4. Auto-Focus Map logic
    const focusMap = () => {
        if (!mapRef.current) return;
        
        // Map everything to strict numeric coordinates
        const stayCoords = staysData.map(s => ({ latitude: Number(s.latitude), longitude: Number(s.longitude) }));
        const eventCoords = scheduledEvents.map(e => ({ latitude: Number(e.latitude), longitude: Number(e.longitude) }));
        const allCoords = [...stayCoords, ...eventCoords];

        if (allCoords.length > 0) {
            mapRef.current.fitToCoordinates(allCoords, {
                edgePadding: { top: 150, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    };

    // Trigger map focus when data is ready and the tab is actively focused
    useEffect(() => {
        if (isFocused && !isLoading) {
            setTimeout(focusMap, 500); // Slight delay ensures MapView is fully rendered before zooming
        }
    }, [isFocused, isLoading, staysData, timelineData]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BlurView intensity={40} style={{ width: 'auto', borderRadius: 15, overflow: 'hidden', marginTop: 10, alignItems: 'center' }}>
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

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isFocused ? (
                <MapView 
                    ref={mapRef}
                    style={styles.map} 
                    showsUserLocation={hasLocationPermission}
                >
                    {/* Render Accommodations (Blue Bed Icon) */}
                    {staysData.map((stay) => (
                        <Marker 
                            key={`stay-${stay.accommodation_id}`}
                            coordinate={{ latitude: Number(stay.latitude), longitude: Number(stay.longitude) }}
                            title={stay.title}
                            description="Accommodation"
                            tracksViewChanges={false}
                        >
                            <View style={[styles.customMarker, { backgroundColor: Colors.primary }]}>
                                <MaterialIcons name="hotel" size={moderateScale(16)} color="white" />
                            </View>
                        </Marker>
                    ))}

                    {/* Render Scheduled Activities (Red Pin Icon) */}
                    {scheduledEvents.map((event) => (
                        <Marker 
                            key={`event-${event.id}`}
                            coordinate={{ latitude: Number(event.latitude), longitude: Number(event.longitude) }}
                            title={event.title}
                            description={event.time}
                            tracksViewChanges={false}
                        >
                            <View style={[styles.customMarker, { backgroundColor: '#E11D48' }]}>
                                <MaterialIcons name="place" size={moderateScale(16)} color="white" />
                            </View>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <View style={styles.map} /> 
            )}
        </View>
    );
}

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
        position: 'absolute', 
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