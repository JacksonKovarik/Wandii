import { Colors } from "@/src/constants/colors";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const BalanceCard = ({ member, onRemind, onPay, currencySymbol }) => {
  const isOwed = member.balance > 0; 
  const names = member.name.trim().split(/\s+/);
  
  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);
  
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberInfo}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center'}]}>
            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '700'}}>
              {(firstInitial + lastInitial).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={[styles.balanceStatus, { color: isOwed ? Colors.success : Colors.danger }]}>
            {isOwed ? 'Owes you' : 'You owe'} {currencySymbol}{Math.abs(member.balance).toFixed(2)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.actionBtn, isOwed ? styles.btnOutline : styles.btnFilled]}
        onPress={() => isOwed ? onRemind(member) : onPay(member)}
      >
        <Text style={[styles.btnText, isOwed ? { color: Colors.darkBlue } : { color: 'white' }]}>
          {isOwed ? 'Remind' : 'Pay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    memberInfo: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    avatar: { width: moderateScale(42), height: moderateScale(42), borderRadius: moderateScale(21), borderWidth: moderateScale(2), borderColor: Colors.lightGray },
    memberName: { fontSize: moderateScale(15), fontWeight: '700', color: Colors.darkBlue },
    balanceStatus: { fontSize: moderateScale(12), fontWeight: '600' },
    
    actionBtn: { paddingVertical: moderateScale(6), paddingHorizontal: moderateScale(16), borderRadius: 10, minWidth: moderateScale(80), alignItems: 'center' },
    btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.lightGray },
    btnFilled: { backgroundColor: Colors.darkBlue },
    btnText: { fontSize: 12, fontWeight: '600' },
});