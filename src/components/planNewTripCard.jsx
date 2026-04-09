import { Colors } from "@/src/constants/colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from "expo-blur";
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PlanNewTripCard() {
  const router = useRouter();

  async function handlePress() {
    router.push({ pathname: "/(add-trips)/tripPlanFirst" });
  }

  return(
  	<View style={styles.card}>
		<View style={{ paddingHorizontal: 15, paddingVertical: 10, marginVertical: 10, alignSelf: 'flex-start', borderRadius: 10, borderWidth: .8, borderColor: 'white' }}>
  			<BlurView intensity={30} tint="light" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(213, 213, 213, 0.35)' }}/>
			<FontAwesome name="location-arrow" size={35} color="white" />
		</View>
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
    marginTop: 15,
    borderRadius: 20,
  },
  titleText: {
  	color: "white",
    fontSize: 26,
	fontWeight: "bold",
  	paddingVertical: 5,
  },
  text: {
  	color: "white",
  	fontSize: 15,
	fontWeight: "500",
  	paddingVertical: 5,
  	paddingBottom: 10,
	marginBottom: 10,
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