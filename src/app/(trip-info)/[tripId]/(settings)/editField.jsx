import { Colors } from "@/src/constants/colors";
import { useTripDashboard } from "@/src/hooks/useTripDashboard"; // ADDED
import { supabase } from "@/src/lib/supabase";
import { useMutation, useQueryClient } from '@tanstack/react-query'; // ADDED
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
  const queryClient = useQueryClient();
  
  // Get tripId from our new hook instead of passing it as a parameter
  const { tripId } = useTripDashboard();
  const { fieldKey, fieldLabel, currentValue } = useLocalSearchParams();
  
  const [value, setValue] = useState(currentValue || "");

  // 憖 Implement the Mutation for saving the field
  const { mutate: updateField, isPending: isSaving } = useMutation({
    onMutate: async (newValue) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tripDashboard', tripId] });

      // Snapshot previous state for rollback
      const previousTrip = queryClient.getQueryData(['tripDashboard', tripId]);

      // Optimistically update the cache immediately
      queryClient.setQueryData(['tripDashboard', tripId], (old) => {
        if (!old) return old;
        return { ...old, [fieldKey]: newValue };
      });

      return { previousTrip };
    },
    mutationFn: async (newValue) => {
      const dbColumn = fieldKey === 'name' ? 'trip_name' : fieldKey;
      const { error } = await supabase
        .from('Trips')
        .update({ [dbColumn]: newValue })
        .eq('trip_id', tripId);
        
      if (error) throw error;
    },
    onError: (err, newValue, context) => {
      console.error(`Error updating ${fieldKey}:`, err);
      // Roll back on error
      queryClient.setQueryData(['tripDashboard', tripId], context.previousTrip);
    },
    onSettled: () => {
      // Sync strictly with DB
      queryClient.invalidateQueries({ queryKey: ['tripDashboard', tripId] });
    },
    onSuccess: () => {
      console.log(`${fieldKey} updated successfully!`);
      router.back();
    }
  });

  const handleSave = () => {
    if (!value.trim() || value === currentValue) {
      router.back();
      return; 
    }
    updateField(value.trim());
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