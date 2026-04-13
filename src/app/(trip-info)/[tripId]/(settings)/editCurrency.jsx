import { Colors } from "@/src/constants/colors";
import { CURRENCIES } from "@/src/constants/TripConstants";
import { supabase } from "@/src/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// 憖 IMPORTANT: Import your new TanStack hook instead of the old context
import { useTripDashboard } from "@/src/hooks/useTripDashboard"; // Adjust path as needed

export default function EditCurrencyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Pull the current data straight from your TanStack cache
  const { tripId, defaultCurrency } = useTripDashboard();
  
  // Local state for immediate visual feedback
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency || 'USD');

  // 憖 The new mutation for flawless optimistic updates
  const { mutate: updateCurrency, isPending: isSaving } = useMutation({
    onMutate: async (newCurrencyCode) => {
      setSelectedCurrency(newCurrencyCode);

      // Cancel outgoing refetches to prevent overwriting
      await queryClient.cancelQueries({ queryKey: ['tripDashboard', tripId] });

      // Snapshot previous state for rollback
      const previousTripData = queryClient.getQueryData(['tripDashboard', tripId]);

      // Optimistically update the cache
      queryClient.setQueryData(['tripDashboard', tripId], (old) => {
        if (!old) return old;
        return { ...old, defaultCurrency: newCurrencyCode };
      });

      return { previousTripData };
    },
    mutationFn: async (newCurrencyCode) => {
      const { error } = await supabase
        .from('Trips')
        .update({ default_currency: newCurrencyCode })
        .eq('trip_id', tripId);

      if (error) throw error;
    },
    onError: (err, newCurrencyCode, context) => {
      console.error("Error updating currency:", err);
      Alert.alert("Error", "Could not save currency. Please try again.");
      
      // Rollback on failure
      setSelectedCurrency(context.previousTripData?.defaultCurrency || 'USD');
      queryClient.setQueryData(['tripDashboard', tripId], context.previousTripData);
    },
    onSettled: () => {
      // Sync strictly with the database
      queryClient.invalidateQueries({ queryKey: ['tripDashboard', tripId] });
    }
  });

  const handleSelectCurrency = (currency) => {
    updateCurrency(currency.code);
  };

  const renderCurrency = ({ item }) => {
    const isSelected = selectedCurrency === item.code;

    return (
      <TouchableOpacity 
        style={[styles.currencyRow, isSelected && styles.currencyRowSelected]} 
        onPress={() => handleSelectCurrency(item)}
        activeOpacity={0.7}
        disabled={isSaving}
      >
        <View style={styles.currencyLeft}>
          <View style={[styles.symbolBadge, isSelected && styles.symbolBadgeSelected]}>
            <Text style={[styles.symbolText, isSelected && styles.symbolTextSelected]}>
              {item.symbol}
            </Text>
          </View>
          <View>
            <Text style={[styles.currencyCode, isSelected && styles.textSelected]}>
              {item.code}
            </Text>
            <Text style={styles.currencyName}>{item.name}</Text>
          </View>
        </View>

        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBtn} /> 
        <Text style={styles.title}>Default Currency</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={CURRENCIES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContainer}
        renderItem={renderCurrency}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: moderateScale(20), paddingTop: moderateScale(20), paddingBottom: moderateScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lightGray,
  },
  headerBtn: { minWidth: moderateScale(60), alignItems: 'flex-end', justifyContent: 'center' },
  title: { fontSize: moderateScale(17), fontWeight: '700', color: Colors.darkBlue },
  doneText: { fontSize: moderateScale(16), color: Colors.primary, fontWeight: '600' },
  
  listContainer: { padding: moderateScale(20), paddingTop: moderateScale(10) },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  currencyRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F8FAFC', // Very subtle tint for selected state
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(14),
  },
  symbolBadge: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolBadgeSelected: {
    backgroundColor: Colors.primary,
  },
  symbolText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  symbolTextSelected: {
    color: '#FFFFFF',
  },
  currencyCode: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: moderateScale(2),
  },
  currencyName: {
    fontSize: moderateScale(13),
    color: Colors.textSecondaryLight,
    fontWeight: '500',
  },
  textSelected: {
    color: Colors.primary,
  }
});