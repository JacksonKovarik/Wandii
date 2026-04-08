import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function AddTripHeader({ title }) {
    const router = useRouter();
    const page = title === "tripPlanFirst" ? 1 : title === "tripPlanSecond" ? 2 : 3;
    const isFirstPage = title === "tripPlanFirst";

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons 
                        name={isFirstPage ? "close" : "arrow-back"} 
                        size={28} 
                        color="black" 
                    />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={[styles.progressDot, page >= 2 ? styles.progressActive : styles.progressInactive]} />
                    <View style={[styles.progressDot, page === 3 ? styles.progressActive : styles.progressInactive]} />
                </View>
                <View style={styles.spacer} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 10,
    },
    headerRow: {
        flexDirection: 'row',
        marginVertical: 20,
        marginBottom: 10,
        marginHorizontal: '5%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressActive: {
        backgroundColor: '#FF8820',
    },
    progressInactive: {
        backgroundColor: '#CCCCCC',
    },
    spacer: {
        width: 28,
    },
});