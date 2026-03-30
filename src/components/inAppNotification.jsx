import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "../constants/colors";

const InAppNotification = (props) => {
    return (
        <View style={[styles.container, { borderLeftColor: props.color }]}>
            <View style={[styles.iconContainer, { backgroundColor: props.lightColor }]}>
                <MaterialIcons name={props.icon} size={moderateScale(20)} color={props.color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{props.title}</Text>
                <Text style={styles.description}>{props.description}</Text>
            </View>
            <TouchableOpacity 
                hitSlop={{ top: 20, bottom: 20, left: 40, right: 20 }}
                onPress={props.onPress}
            >
                <MaterialIcons name="chevron-right" size={moderateScale(20)} color={Colors.textSecondaryLight} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(15),
        padding: moderateScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: moderateScale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    iconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(25),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(15),
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        marginBottom: moderateScale(5),
        color: Colors.textPrimary,
    },
    description: {
        fontSize: moderateScale(10),
        color: Colors.textSecondary,
    },
});

export default InAppNotification;