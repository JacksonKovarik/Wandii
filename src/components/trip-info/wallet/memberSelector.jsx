import { Colors } from "@/src/constants/colors";
import Checkbox from "expo-checkbox";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const MemberSelecter = ({ member, isSplitEqually, splitData, onUpdateSplit, currencySymbol }) => {
  // 🌟 FIX: isSelected is now strictly true if they are in the dictionary, regardless of the "Split Equally" toggle
  const isSelected = splitData !== undefined;
  const exactAmount = splitData !== undefined ? String(splitData) : '';

  const memberName = member?.name || "Unknown";
  const firstInitial = memberName.trim().charAt(0) || '';
  const lastInitial = memberName.trim().split(/\s+/).pop().charAt(0) || '';

  return (
    <TouchableOpacity 
      style={[styles.memberSelectorCard, isSelected ? styles.memberSelectorCardActive : {} ]} 
      // 🌟 FIX: Removed the disabled lock so you can click them anytime
      onPress={() => onUpdateSplit(member.id, { selected: !isSelected, amount: exactAmount })}
    >
      <View style={styles.memberSelectorInfo}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.selectorAvatar} />
        ) : (
          <View style={[
              styles.selectorAvatar, 
              { backgroundColor: isSelected ? Colors.primary : 'white', alignItems: 'center', justifyContent: 'center'}, 
              !isSelected && { borderWidth: 1, borderColor: Colors.textSecondaryLight }
          ]}>
            <Text style={{ color: isSelected ? 'white': Colors.textSecondaryLight, fontSize: 13, fontWeight: '700'}}>
              {(firstInitial + lastInitial).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.selectorName, isSelected ? { color: Colors.darkBlue } : { color: Colors.textSecondaryLight }]}>
            {memberName}
        </Text>
      </View>
      
      {isSplitEqually ? (
        <Checkbox
          value={isSelected} // 🌟 FIX: Now reflects exactly if they are selected or not
          onValueChange={() => onUpdateSplit(member.id, { selected: !isSelected, amount: exactAmount })}
          color={isSelected ? Colors.primary : undefined}
          style={styles.selectorCheckbox}
          // 🌟 FIX: Removed the disabled lock here too
        />
      ) : (
        isSelected && (
          <View style={styles.exactAmountWrapper}>
            <Text style={styles.exactAmountSymbol}>{currencySymbol}</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondaryDark}
              keyboardType="decimal-pad"
              value={exactAmount}
              onChangeText={(text) => onUpdateSplit(member.id, { selected: true, amount: text })}
              style={styles.exactAmountInput}
              autoFocus
            />
          </View>
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  memberSelectorCard: {  flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.textSecondaryLight },
  memberSelectorCardActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  memberSelectorInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectorAvatar: { width: 36, height: 36, borderRadius: 18 },
  selectorName: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  selectorCheckbox: { borderWidth: 1, borderRadius: 10 },
  exactAmountWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 8 },
  exactAmountSymbol: { color: Colors.textSecondaryDark, fontWeight: '600', marginRight: 2 },
  exactAmountInput: { minWidth: 60, paddingVertical: 6, fontSize: 14, fontWeight: '600', color: Colors.darkBlue, textAlign: 'center' },
});