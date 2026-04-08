import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// 1. Import your context hook
import { useTrip } from "@/src/utils/TripContext";

export default function EditDestinationsScreen() {
  const router = useRouter();
  
  // 2. Consume the context data
  const tripData = useTrip();
  
  const [inputValue, setInputValue] = useState("");
  const [destinations, setDestinations] = useState([]);

  // 3. Populate local state when the context data loads
  useEffect(() => {
    if (tripData && tripData.destination) {
      console.log("Loaded trip data:", tripData.destination);

      // If it's a string, parse it. (Also guarding just in case it ever comes back as an array)
      if (typeof tripData.destination === 'string') {
        const parsedDestinations = tripData.destination
          .split('&') // Split by the ampersand
          .map(dest => dest.trim()) // Remove any extra spaces around the names
          .filter(dest => dest.length > 0) // Remove any accidentally empty strings
          .map((destName, index) => ({
            // Generate a temporary unique ID for the FlatList to use
            id: `initial-${index}-${Date.now()}`, 
            name: destName
          }));

        setDestinations(parsedDestinations);
      } else if (Array.isArray(tripData.destination)) {
        // Fallback in case your DB ever returns an array
        setDestinations(tripData.destination);
      }
    }
  }, [tripData]);

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    
    // Create a temporary object for the UI
    const newDest = { id: Date.now().toString(), name: inputValue.trim() };
    setDestinations([...destinations, newDest]);
    setInputValue("");

    try {
      // TODO: Insert into your Supabase Trip_Destinations table here
      // Example: await supabase.from('Trip_Destinations').insert({...})
      
      // Optional: If your context has a refresh function, call it here
      // refreshTripData(); 
    } catch (error) {
      console.error("Error adding destination:", error);
    }
  };

  const handleDelete = async (idToRemove) => {
    // Optimistically update the UI
    setDestinations(destinations.filter(dest => dest.id !== idToRemove));

    try {
      // TODO: Delete from your Supabase Trip_Destinations table here
      // Example: await supabase.from('Trip_Destinations').delete().eq('id', idToRemove)
      
      // Optional: refreshTripData();
    } catch (error) {
      console.error("Error deleting destination:", error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Destinations</Text>
        <View style={styles.headerBtn} /> 
      </View>

      {/* --- Input Area --- */}
      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add a destination..."
            placeholderTextColor={Colors.textSecondaryLight}
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity 
            style={[styles.addBtn, !inputValue.trim() && styles.addBtnDisabled]} 
            onPress={handleAdd}
            disabled={!inputValue.trim()}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Destinations List --- */}
      <FlatList
        data={destinations}
        // Ensure you are using the correct unique ID from your database here
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.destinationRow}>
            <View style={styles.destinationLeft}>
              <MaterialIcons name="location-pin" size={22} color={Colors.primary} />
              <Text style={styles.destinationName}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <MaterialIcons name="remove-circle-outline" size={22} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No destinations added yet.</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: moderateScale(20), paddingTop: moderateScale(20), paddingBottom: moderateScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray,
  },
  headerBtn: { minWidth: moderateScale(60), justifyContent: 'center' },
  title: { fontSize: moderateScale(17), fontWeight: '700', color: Colors.darkBlue },
  doneText: { fontSize: moderateScale(16), color: Colors.primary, fontWeight: '600' },
  inputSection: { padding: moderateScale(20), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundLight,
    borderRadius: moderateScale(12), paddingHorizontal: moderateScale(12),
  },
  input: { flex: 1, fontSize: moderateScale(16), color: Colors.darkBlue, paddingVertical: moderateScale(12) },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: 20, padding: moderateScale(4), marginLeft: moderateScale(8)
  },
  addBtnDisabled: { backgroundColor: Colors.lightGray },
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