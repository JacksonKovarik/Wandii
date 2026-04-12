import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import LocationSearchBar from "@/src/components/locationSearchBar";
import { createTripDestinationLink } from "@/src/lib/trips";
import { useTrip } from "@/src/utils/TripContext";

export default function EditDestinationsScreen() {
  const router = useRouter();
  const tripData = useTrip();
  const tripId = tripData?.trip_id || tripData?.id; 
  const [destinations, setDestinations] = useState([]);

  const { updateTripContext } = tripData;
  
  // Load existing destinations
  // Load existing destinations
  useEffect(() => {
    if (tripData && tripData.destination) {
      if (typeof tripData.destination === 'string') {
        const parsedDestinations = tripData.destination
          .split('&') 
          .map(dest => dest.trim()) 
          .filter(dest => dest.length > 0) 
          .map((destName, index) => ({
            id: `initial-${index}-${Date.now()}`, 
            name: destName
          }));
        setDestinations(parsedDestinations);
        
      } else if (Array.isArray(tripData.destination)) {
        // 1. Map the array into a completely new array
        const parsedDestinations = tripData.destination.map((dest, index) => {
            // Failsafe in case a string accidentally snuck into the array
            if (typeof dest === 'string') {
              return { id: `initial-${index}-${Date.now()}`, name: dest };
            }

            const displayCountry = (dest.country && dest.country.length > 10 && dest.country_code) 
              ? dest.country_code 
              : dest.country;
            
            // Allow for fallbacks so it doesn't return an empty string if city is missing
            const name = (dest.city && displayCountry) 
              ? `${dest.city}, ${displayCountry}` 
              : (dest.city || displayCountry || dest.name || 'Unknown Destination');
            
            return { 
                id: `initial-${index}-${Date.now()}`, 
                name 
            };
        });

        // 2. Set the state exactly once, OVERWRITING previous state instead of appending
        setDestinations(parsedDestinations);
      }
    } else {
        // Clear destinations if tripData.destination becomes empty
        setDestinations([]);
    }
  }, [tripData]);

  // ==========================================
  // SAVE DESTINATION
  // ==========================================
  const handleSelectLocation = async (item) => {
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.address?.state;
    const country = item.address?.country;
    const countryCode = item.address?.country_code?.toUpperCase();
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    const displayCountry = (country && country.length > 10 && countryCode) 
      ? countryCode 
      : country;
    const displayName = city && displayCountry ? `${city}, ${displayCountry}` : item.display_name.split(',')[0];

    // 3. Optimistic UI update
    const newDest = { id: Date.now().toString(), name: displayName };
    setDestinations([...destinations, newDest]);
    
    const newDestObj = {
      name: displayName,
      city: city || null,
      country: country || null,
      countryCode: countryCode || null,
      latitude: lat,
      longitude: lng
    };

    if (updateTripContext) {
      // Ensure we are working with an array, then append the new destination
      const currentContextDests = Array.isArray(tripData.destination) ? tripData.destination : [];
      updateTripContext({ destination: [...tripData.destination, newDestObj] });
    }

    createTripDestinationLink(tripId, [newDestObj], tripData.startDate, tripData.endDate);
  };

  const handleDelete = async (itemToRemove) => {
    // 1. Optimistically update the UI instantly so it feels snappy
    setDestinations(prev => prev.filter(dest => dest.id !== itemToRemove.id));

    try {
      // 2. Parse the city and country from our display name (e.g. "Paris, France")
      const nameParts = itemToRemove.name.split(',');
      const city = nameParts[0].trim();
      const country = nameParts.length > 1 ? nameParts[1].trim() : null;
      console.log(city, country)

      const { data: cachedDest, error: fetchError } = await supabase
        .from('cached_destinations')
        .select('destination_id')
        .eq('city', city)
        .eq('country', country)
        // .single();

      if (fetchError || !cachedDest) {
        console.warn("Could not find destination in cache to delete:", fetchError);
        return; 
      }

      // 4. Delete the relationship from Trip_Destinations
      const { error: deleteError } = await supabase
        .from('Trip_Destinations')
        .delete()
        .match({ 
          trip_id: tripId, 
          destination_id: cachedDest.destination_id 
        });

      if (deleteError) throw deleteError;

    } catch (error) {
      console.error("Database error deleting destination:", error);
      // Optional: If the database deletion fails, you could add it back to the UI state here
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Destinations</Text>
        <View style={styles.headerBtn} /> 
      </View>

      {/* SEARCH SECTION - Look how clean this is now! */}
      <View style={{ paddingHorizontal: moderateScale(20), paddingTop: moderateScale(20), zIndex: 10 }}>
          <LocationSearchBar 
            placeholder="Search for a city..." 
            onSelect={handleSelectLocation} 
          />
      </View>

      {/* DESTINATIONS LIST */}
      <View style={{ flex: 1, zIndex: 0 }}>
          <FlatList
            data={destinations}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled" 
            renderItem={({ item }) => (
              <View style={styles.destinationRow}>
                <View style={styles.destinationLeft}>
                  <MaterialIcons name="location-pin" size={22} color={Colors.primary} />
                  <Text style={styles.destinationName}>{item.name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                  <MaterialIcons name="remove-circle-outline" size={22} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No destinations added yet.</Text>
            }
          />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: moderateScale(20), paddingTop: moderateScale(20), paddingBottom: moderateScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray,
    zIndex: 1, 
  },
  headerBtn: { minWidth: moderateScale(60), justifyContent: 'center' },
  title: { fontSize: moderateScale(17), fontWeight: '700', color: Colors.darkBlue },
  doneText: { fontSize: moderateScale(16), color: Colors.primary, fontWeight: '600' },
  
  // Input Styles
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    height: moderateScale(50),
  },
  input: { 
    flex: 1,
    fontSize: moderateScale(16), 
    color: Colors.darkBlue, 
  },

  // Dropdown Styles
  dropdown: {
    position: 'absolute',
    top: moderateScale(75),
    left: moderateScale(20),
    right: moderateScale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    maxHeight: moderateScale(250),
    paddingVertical: moderateScale(8),
  },
  dropdownRow: {
    flexDirection: 'row',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightGray,
  },
  dropdownTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.darkBlue,
  },
  dropdownSubtitle: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attribution: {
    fontSize: moderateScale(10),
    color: Colors.textSecondaryLight,
    textAlign: 'center',
    paddingTop: moderateScale(8),
    fontStyle: 'italic'
  },

  // List Styles
  listContainer: { padding: moderateScale(20) },
  destinationRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.backgroundLight, padding: moderateScale(16),
    borderRadius: moderateScale(12), marginBottom: moderateScale(12),
  },
  destinationLeft: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
  destinationName: { fontSize: moderateScale(16), color: Colors.darkBlue, fontWeight: '500' },
  deleteBtn: { padding: moderateScale(4) },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: moderateScale(20) }
});