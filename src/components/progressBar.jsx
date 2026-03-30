import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { Colors } from "../constants/colors";


const progressBar = (props) => {
    return (
        <View style={{ width: props.width, height: props.height || 10, backgroundColor: props.backgroundColor || '#e0e0e0', borderRadius: 5, overflow: 'hidden' }}>
            <BlurView
                intensity={20}
                style={{
                    ...StyleSheet.absoluteFillObject,
                    borderRadius: 5,
                }}
            />  
            <View style={{ width: props.progress, height: props.height || 10, backgroundColor: props.progressColor || Colors.primary, borderRadius: 5 }}></View>
        </View>
    )
};

export default progressBar;