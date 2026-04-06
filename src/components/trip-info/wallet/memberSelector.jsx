import { Colors } from "@/src/constants/colors";
import Checkbox from "expo-checkbox";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";



export const MemberSelecter = ({ member, isSplitEqually, splitData, onUpdateSplit, currencySymbol }) => {
  const isSelected = splitData?.selected || false;
  const exactAmount = splitData?.amount || '';

  const firstInitial = member.name.trim().charAt(0);
  const lastInitial = member.name.trim().split(/\s+/).pop().charAt(0);

  return (
    <TouchableOpacity 
      style={[styles.memberSelectorCard, isSelected ? styles.memberSelectorCardActive : {} ]} 
      onPress={() => onUpdateSplit(member.id, { selected: !isSelected, amount: exactAmount })}
    >
      <View style={styles.memberSelectorInfo}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.selectorAvatar} />
        ) : (
          <View style={[styles.selectorAvatar, { backgroundColor: isSelected ? Colors.primary : 'white',alignItems: 'center', justifyContent: 'center'}, !isSelected && {borderWidth: 1, borderColor: Colors.textSecondaryLight}]}>
            <Text style={{ color: isSelected ? 'white': Colors.textSecondaryLight, fontSize: 13, fontWeight: '700'}}>
              {(firstInitial + lastInitial).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.selectorName, isSelected ? { color: Colors.darkBlue } : { color: Colors.textSecondaryLight }]}>
          {member.name}
        </Text>
      </View>

      { isSplitEqually ? (
        <Checkbox
          value={isSelected}
          onValueChange={() => onUpdateSplit(member.id, { selected: !isSelected, amount: exactAmount })}
          color={isSelected ? Colors.primary : undefined}
          style={styles.selectorCheckbox}
        />
      ) : (
        isSelected && (
          <View style={styles.exactAmountWrapper}>
            <Text style={styles.exactAmountSymbol}>{currencySymbol}</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondaryDark}
              keyboardType="numeric"
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
});