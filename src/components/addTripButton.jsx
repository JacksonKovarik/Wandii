import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { TouchableOpacity } from "react-native";

export default function AddTripButton({
    bgColor = "#F3F4F6",
    iconColor = "#FF8820",
    size = 50,
    centered = false,

}) {
    return (
        <Link href={"/(add-trips)/tripPlanFirst"} push asChild>
            <TouchableOpacity 
                style={{ 
                    height: size, 
                    width: size, 
                    marginLeft: 'auto', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: bgColor, 
                    borderRadius: size / 2 
                }}
            >
                <MaterialIcons 
                name="add" 
                size={size * 0.6} 
                color={iconColor} />
            </TouchableOpacity>
        </Link>
    );
};