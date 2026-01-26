import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { TouchableOpacity } from "react-native";

export default function AddTripButton() {
    return (
        <Link href={"/(add-trips)/tripPlanFirst"} push asChild>
            <TouchableOpacity 
                style={{ 
                    height: 50, 
                    width: 50, 
                    marginLeft: 'auto', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: '#F3F4F6', 
                    borderRadius: 50 / 2 
                }}
            >
                <MaterialIcons name="add" size={30} color="#FF8820" />
            </TouchableOpacity>
        </Link>
    );
};