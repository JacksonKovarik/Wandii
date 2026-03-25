import { StyleSheet, View } from "react-native";
import { Colors } from "../constants/colors";

// 1. Capitalize the component name!
const ProgressBar = (props) => {
    return (
        <View style={{ width: props.width, height: props.height || 10, borderRadius: 5, overflow: 'hidden' }}>
            <View style={[
                StyleSheet.absoluteFillObject, 
                { backgroundColor: props.backgroundColor || 'rgba(224, 224, 224, 0.5)' }
            ]} />

            <View style={{ 
                width: props.progress, 
                height: props.height || 10, 
                backgroundColor: props.progressColor || Colors.primary, 
                borderRadius: 5 
            }} />
            
        </View>
    )
};

export default ProgressBar;