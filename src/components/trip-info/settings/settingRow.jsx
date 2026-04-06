import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";


const SettingRow = ({ icon, title, value, type = 'link', onPress, isDestructive = false }) => (
  <TouchableOpacity 
    style={styles.row} 
    onPress={onPress} 
    disabled={type === 'switch'}
    activeOpacity={0.6}
  >
    <View style={styles.rowLeft}>
      {icon && <MaterialIcons name={icon} size={24} color={isDestructive ? Colors.danger : Colors.darkBlue} />}
      <Text style={[styles.rowTitle, isDestructive && { color: Colors.danger }]}>{title}</Text>
    </View>
    
    <View style={styles.rowRight}>
      {type === 'link' && (
        <>
          {value && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
          <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondaryLight} />
        </>
      )}
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onPress} 
          trackColor={{ true: Colors.primary, false: Colors.lightGray }}
          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }} 
        />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(14), 
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(16),
  },
  rowTitle: {
    fontSize: moderateScale(16),
    color: Colors.darkBlue,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: moderateScale(8),
    maxWidth: '50%', 
  },
  rowValue: {
    fontSize: moderateScale(15),
    color: Colors.textSecondary, 
    flexShrink: 1, 
    textAlign: 'right', 
  },
});

export default SettingRow;