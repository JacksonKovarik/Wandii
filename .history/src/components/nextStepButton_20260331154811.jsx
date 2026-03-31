import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export default function NextStepButton({ href }) {
  return (
    <View style={ styles.bottomContainer }>
        <Link href={ href } asChild>
            <TouchableOpacity style={ styles.button }>
                <Text style={ styles.text }>Next Step</Text>
            </TouchableOpacity>  
        </Link>
    </View>
  );
}

const styles = StyleSheet.create ({
    button: {
        width: '90%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(10),
        alignItems: 'center',
    },

    bottomContainer: {
        width: '100%',
        height: verticalScale(120),
        backgroundColor: 'white',
        borderTopWidth: scale(1),
        borderTopColor: "#d9d9d9",
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: scale(2), 
        elevation: 2,
        paddingHorizontal: scale(5),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },

    text: {
        color: 'white',
        fontWeight: '600',
        fontSize: moderateScale(18),
    }
});


