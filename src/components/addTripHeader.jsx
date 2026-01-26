import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from "react-native";

export default function AddTripHeader({ title }) {
    const router = useRouter();
    let page = title === "tripPlanFirst" ? 1 : title === "tripPlanSecond" ? 2 : 3;

    return (
        <View style={{ backgroundColor: 'white', padding: 10 }}>
            <View style={{ flexDirection: 'row', marginVertical: 20, marginBottom: 10, marginHorizontal: '5%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => { router.back() }} >
                        { title === "tripPlanFirst" ? <MaterialIcons name="close" size={28} color="black" /> : <MaterialIcons name="arrow-back" size={28} color="black" /> }
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF8820' }} />
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: page >= 2 ? '#FF8820' : '#CCCCCC' }} />
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: page === 3 ? '#FF8820' : '#CCCCCC' }} />
                    </View>
                    <View style={{ width: 28 }} />
            </View>
        </View>
    );
};