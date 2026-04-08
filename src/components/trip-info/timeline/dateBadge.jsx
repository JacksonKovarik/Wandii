import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { StyleSheet, Text, TouchableOpacity } from "react-native";


const DateBadge = ({ dateStr, isSelected, onPress }) => {
    const dateObj = DateUtils.parseYYYYMMDDToDate(dateStr);
    
    return (
        <TouchableOpacity 
            style={[styles.dateBadge, isSelected ? styles.dateBadgeSelected : styles.dateBadgeUnselected]} 
            onPress={() => onPress(dateObj)}
        >
            <Text style={[styles.dateBadgeDayText, isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeTextUnselected]}>
                {dateObj.getDate()}
            </Text>
            <Text style={[styles.dateBadgeDayOfWeekText, isSelected ? styles.dateBadgeTextSelected : styles.dateBadgeDayOfWeekTextUnselected]}>
                {dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    dateBadge: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1 },
    dateBadgeSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    dateBadgeUnselected: { backgroundColor: 'white', borderColor: '#e2e8f0' },
    dateBadgeDayText: { fontSize: 20, fontWeight: '800' },
    dateBadgeDayOfWeekText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    dateBadgeTextSelected: { color: 'white' },
    dateBadgeTextUnselected: { color: '#0f172a' },
    dateBadgeDayOfWeekTextUnselected: { color: '#64748b' },
});

export default DateBadge;