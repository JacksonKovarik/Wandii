import { Colors } from "@/src/constants/colors";
import { supabase } from "@/src/lib/supabase";
import { useTrip } from "@/src/utils/TripContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function EditFieldScreen() {
  const router = useRouter();
  
  // Grab the parameters passed from the settings screen
  const { fieldKey, fieldLabel, currentValue, tripId } = useLocalSearchParams();
  const { updateTripField } = useTrip();
  const [value, setValue] = useState(currentValue || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!value.trim() || value === currentValue) {
      router.back();
      return; 
    }
    
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('Trips')
        .update({ [fieldKey]: value.trim() })
        .eq('trip_id', tripId);
        
      updateTripField(fieldKey, value.trim()); // Update the context with the new value
      console.log(`${fieldKey} updated successfully!`);
      // INSTEAD OF router.back(), navigate to the settings screen and pass the new data
      router.back();

    } catch (error) {
      console.error(`Error updating ${fieldKey}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.6}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>{fieldLabel}</Text>
        
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isSaving} 
          style={styles.headerBtn}
          activeOpacity={0.6}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={[styles.saveText, value === currentValue && styles.disabledText]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{fieldLabel}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          autoFocus
          clearButtonMode="while-editing"
          placeholder={`Enter new ${fieldLabel.toLowerCase()}`}
          placeholderTextColor={Colors.textSecondaryLight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightGray,
  },
  headerBtn: {
    minWidth: moderateScale(60),
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  cancelText: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
  },
  saveText: {
    fontSize: moderateScale(16),
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  disabledText: {
    color: Colors.textSecondaryLight,
  },
  inputContainer: {
    padding: moderateScale(20),
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: moderateScale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: moderateScale(18),
    color: Colors.darkBlue,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingVertical: moderateScale(10),
  }
});