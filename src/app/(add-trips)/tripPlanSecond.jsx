import NextStepButton from "@/src/components/nextStepButton";
import { useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

export default function TripPlanSecond() {
const [searchFriend, setSearchFriend] = useState('');

  return (
    <View style={ styles.screen }>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={ styles.header }>Invite Friends</Text>
        <Text style={ styles.subHeader }>
          Trips are better together. Invite your friends!
        </Text>

        <View style={ styles.inputBar }>
          <TextInput
            value={ searchFriend }
            onChangeText={ setSearchFriend }
            placeholder='Search friends by name or handle'
            placeholderTextColor='#9d9d9d'
            style={ styles.inputText }
            multiline={ false }
            numberOfLines={ 1 }
            maxLength={ 45 }
          />
        </View>
      </View>

    </TouchableWithoutFeedback>

      <NextStepButton href="/(add-trips)/tripPlanThird" />
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    paddingVertical: verticalScale(16),   
    borderRadius: moderateScale(10),      
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  inputText: {
    fontSize: moderateScale(15),          
    color: 'black',
  },

  header: {
    fontSize: moderateScale(28),          
    fontWeight: '700',
  },

  subHeader: {
    fontSize: moderateScale(15),          
    marginBottom: 30,
    color: '#626262',
  },

  screen: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: verticalScale(15),
    paddingHorizontal: moderateScale(10),
  },
});
