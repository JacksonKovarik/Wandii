import { Colors } from "@/src/constants/colors";
import { CURRENCIES } from "@/src/constants/TripConstants"; // Ensure this is defined with code, name, and symbol for each currency
import { supabase } from "@/src/lib/supabase"; // Adjust to your Supabase import
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function EditCurrencyScreen() {
  const router = useRouter();
  
  // Assume your context exposes the current currency and a way to update it locally
  const { tripId, defaultCurrency, default_currency, updateTripContext } = useTrip();
  
  // Keep track of the currently selected currency code locally for the UI
  const [selectedCurrency, setSelectedCurrency] = useState(default_currency && default_currency !== undefined ? default_currency : defaultCurrency);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectCurrency = async (currency) => {
    // Optimistic UI update
    setSelectedCurrency(currency.code);
    setIsSaving(true);

    try {
      // 1. Update the database (Ensure 'default_currency' matches your Trips table column)
      const { error } = await supabase
        .from('Trips')
        .update({ default_currency: currency.code })
        .eq('trip_id', tripId);

      if (error) throw error;

      // 2. Update local context so the previous page shows the new value instantly
      if (updateTripContext) {
        updateTripContext({ defaultCurrency: currency.code });
      }

    } catch (error) {
      console.error("Error updating currency:", error);
      Alert.alert("Error", "Could not save currency. Please try again.");
      // Revert if failed
      setSelectedCurrency(default_currency && default_currency !== undefined ? default_currency : defaultCurrency);
    } finally {
      setIsSaving(false);
    }
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
      {/* --- Header --- */}
      <View style={styles.header}>
        <View style={styles.headerBtn} /> 
        <Text style={styles.title}>Default Currency</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* --- Currency List --- */}
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