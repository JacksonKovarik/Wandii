import { Colors } from "@/src/constants/colors";
import { useTripDashboard } from "@/src/hooks/useTripDashboard"; // ADDED
import { supabase } from "@/src/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from '@tanstack/react-query'; // ADDED
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import LocationSearchBar from "@/src/components/locationSearchBar";
import { createTripDestinationLink } from "@/src/lib/trips";

export default function EditDestinationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Fetch from new hook instead of useTrip
  const { tripId, destination, startDate, endDate } = useTripDashboard(); 
  
  const [destinations, setDestinations] = useState([]);
  const destinationDependency = JSON.stringify(destination);
 
  useEffect(() => {
    if (destination) {
      if (typeof destination === 'string') {
        const parsedDestinations = destination
          .split('&') 
          .map(dest => dest.trim()) 
          .filter(dest => dest.length > 0) 
          .map((destName, index) => ({
            id: `initial-${index}-${Date.now()}`, 
            name: destName
          }));
        setDestinations(parsedDestinations);
      } else if (Array.isArray(destination)) {
        const parsedDestinations = destination.map((dest, index) => {
            if (typeof dest === 'string') return { id: `initial-${index}-${Date.now()}`, name: dest };
            const displayCountry = (dest.country && dest.country.length > 10 && dest.countryCode) ? dest.countryCode : dest.country;
            const name = (dest.city && displayCountry) ? `${dest.city}, ${displayCountry}` : (dest.city || displayCountry || dest.name || 'Unknown Destination');
            return { id: `initial-${index}-${Date.now()}`, name };
        });
        setDestinations(parsedDestinations);
      }
    } else {
        setDestinations([]);
    }
  }, [destinationDependency]);

  
  const handleSelectLocation = async (item) => {
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.address?.state;
    const country = item.address?.country;
    const countryCode = item.address?.country_code?.toUpperCase();
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    const displayCountry = (country && country.length > 10 && countryCode) ? countryCode : country;
    const displayName = city && displayCountry ? `${city}, ${displayCountry}` : item.display_name.split(',')[0];

    const newDest = { id: Date.now().toString(), name: displayName };
    const newDestObj = { name: displayName, city: city || null, country: country || null, countryCode: countryCode || null, latitude: lat, longitude: lng };

    // 1. Optimistic update to Local UI
    setDestinations([...destinations, newDest]);
    
    // 2. 憖 Optimistic update to TanStack Query Cache instead of Context
    queryClient.setQueryData(['tripDashboard', tripId], (old) => {
      if (!old) return old;
      const currentDests = Array.isArray(old.destination) ? old.destination : [];
      return { ...old, destination: [...currentDests, newDestObj] };
    });

    // 3. Save to DB
    createTripDestinationLink(tripId, [newDestObj], startDate, endDate);
  };

  const handleDelete = async (itemToRemove) => {
    // 1. Optimistically update the UI instantly
    setDestinations(prev => prev.filter(dest => dest.id !== itemToRemove.id));

    try {
      const nameParts = itemToRemove.name.split(',');
      const city = nameParts[0].trim();
      const country = nameParts.length > 1 ? nameParts[1].trim() : null;

      const { data: cachedDest, error: fetchError } = await supabase
        .from('cached_destinations')
        .select('destination_id')
        .eq('city', city)
        .eq('country', country);

      if (fetchError || !cachedDest) return; 

      // 2. Fire deletion to DB
      await supabase
        .from('Trip_Destinations')
        .delete()
        .match({ trip_id: tripId, destination_id: cachedDest[0]?.destination_id });

      // 3. 憖 Update TanStack Cache to reflect the removal in the background
      queryClient.setQueryData(['tripDashboard', tripId], (old) => {
        if (!old || !Array.isArray(old.destination)) return old;
        return {
          ...old,
          destination: old.destination.filter(d => d.city !== city)
        };
      });

    } catch (error) {
      console.error("Database error deleting destination:", error);
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