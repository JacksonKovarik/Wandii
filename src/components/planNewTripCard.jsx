import { Colors } from "@/src/constants/colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PlanNewTripCard() {
  const router = useRouter();

  async function handlePress() {
    router.push({ pathname: "/(add-trips)/tripPlanFirst" });
  }

  return(
  	<View style={styles.card}>
  		<FontAwesome name="location-arrow" size={40} color="white" />
  	  <Text style={styles.titleText}>Plan a New Trip</Text>
  	  <Text style={styles.text}>Create a group, set a budget, and start adding events to your itinerary.</Text>
		  <Pressable 
		  	onPress = {handlePress}
		  	style = {styles.button}
		  >
		    <Text style = {styles.buttonText}>+ Create Trip</Text>
		  </Pressable>
	</View>
  )
}

const styles = StyleSheet.create({
  card: {  
    backgroundColor: Colors.primary,
    padding: 15,
    margin: 15,
    borderRadius: 20,
  },
  titleText: {
  	color: "white",
    fontSize: 25,
  	paddingVertical: 5,
  },
  text: {
  	color: "white",
  	fontSize: 15,
  	paddingVertical: 5,
  	paddingBottom: 10,
  },
  button: {
  	backgroundColor: "white",
  	color: Colors.primary,
  	alignItems: "center",
  	borderRadius: 20,
  },
  buttonText: {
  	color: Colors.primary,
  	paddingVertical: 10	,
  },
});