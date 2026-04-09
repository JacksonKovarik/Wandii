import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import LocationSearchBar from "@/src/components/locationSearchBar";
import { useTrip } from "@/src/utils/TripContext";

export default function EditDestinationsScreen() {
  const router = useRouter();
  const tripData = useTrip();
  const tripId = tripData?.trip_id || tripData?.id; 

  const [destinations, setDestinations] = useState([]);
  
  // Custom Search Engine State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
        setDestinations(tripData.destination);
      }
    }
  }, [tripData]);

  // ==========================================
  // DEBOUNCED OSM SEARCH ENGINE
  // ==========================================
  useEffect(() => {
    // If the user clears the input, hide the dropdown
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Wait 800ms after the user stops typing to call the API
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const LOCATION_IQ_KEY = 'pk.29ba43c85df756ee6924d2cf82e92464'
        // Fetch from OSM. We use q= query, and ask for JSON and address details
        const url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        setSearchResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("OSM Search Error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 800); 

    // Clear the timer if the user keeps typing
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  // ==========================================
  // SAVE DESTINATION
  // ==========================================
  const handleSelectLocation = async (item) => {
    // 1. Hide dropdown and clear input instantly
    setShowDropdown(false);
    setSearchQuery("");

    const city = item.address?.city || item.address?.town || item.address?.village || item.name;
    const country = item.address?.country;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    const displayName = city && country ? `${city}, ${country}` : item.name;

    // 3. Optimistic UI update
    const newDest = { id: Date.now().toString(), name: displayName };
    setDestinations([...destinations, newDest]);

    // 4. Save to Database
    try {
        // We use OSM's unique ID instead of Google's Place ID
        const osmId = item.osm_id.toString();

        let { data: existingDest } = await supabase
            .from('cached_destinations')
            .select('destination_id')
            .eq('country', country) // Simplified cache check
            .eq('city', city)
            .single();

        let destinationId = existingDest?.destination_id;

        if (!destinationId) {
            const { data: insertedDest, error: cacheError } = await supabase
                .from('cached_destinations')
                .insert({
                    city: city,
                    country: country,
                    latitude: lat,
                    longitude: lng
                })
                .select()
                .single();
                
            if (cacheError) throw cacheError;
            destinationId = insertedDest.destination_id;
        }

        const arrival = tripData?.start_date || new Date().toISOString();
        const departure = tripData?.end_date || new Date().toISOString();

        await supabase
            .from('Trip_Destinations')
            .insert({
                trip_id: tripId,
                destination_id: destinationId,
                arrival_date: arrival,
                departure_date: departure  
            });

    } catch (error) {
        console.error("Database error adding destination:", error);
    }
  };

  const handleDelete = async (itemToRemove) => {
    // 1. Optimistically update the UI instantly so it feels snappy
    setDestinations(prev => prev.filter(dest => dest.id !== itemToRemove.id));

    try {
      // 2. Parse the city and country from our display name (e.g. "Paris, France")
      const nameParts = itemToRemove.name.split(',');
      const city = nameParts[0].trim();
      const country = nameParts.length > 1 ? nameParts[1].trim() : null;

      // 3. Look up the official destination_id in the cache
      let cacheQuery = supabase
        .from('cached_destinations')
        .select('destination_id')
        .eq('city', city);
        
      if (country) {
        cacheQuery = cacheQuery.eq('country', country);
      }

      const { data: cachedDest, error: fetchError } = await cacheQuery.single();

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