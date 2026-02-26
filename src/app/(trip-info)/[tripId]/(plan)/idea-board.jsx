import DeckSwiper from "@/src/components/DeckSwiper";
import ProgressBar from "@/src/components/progressBar";
import ReusableTabBar from "@/src/components/reusableTabBar";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from "@/src/constants/colors";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const VotingInProgressCard = ({ item }) => {
  return (
    <View 
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10, 
        backgroundColor: '#ffffff', 
        borderRadius: 15, 
        padding: 12, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 3.84, 
        elevation: 5 
      }}
    >
      {/* Swapped the gray box for the actual image */}
      <Image 
          source={item.image} 
          style={{ width: 75, height: 75, borderRadius: 10 }}
          contentFit="cover"
          cachePolicy={"memory-disk"}
      />
      <View style={{ flex: 1}}>
        {/* Swapped hardcoded text for the dynamic title */}
        <Text style={{ fontSize: moderateScale(16), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(2)}}>{item.title}</Text>
        <Text style={{ fontSize: moderateScale(13), color: Colors.gray }}>New Idea • $$</Text>
        <View style={{ marginTop: moderateScale(8) }}>
          <ProgressBar width={'100%'} height={moderateScale(6)} progress={'20%'} progressColor={Colors.success} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, }}>
            <Text style={{ fontSize: moderateScale(11), color: Colors.gray, fontWeight: '600' }}>1/5 Voted</Text>
            <Text style={{ fontSize: moderateScale(11), color: Colors.gray, fontWeight: '600' }}>Waiting on group</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const DiscoverCard = ({ item, swipeLeft, swipeRight }) => {
  return (
    <View style={styles.discoverCardContainer}>
      <View style={styles.discoverCardContent}>
        <Image 
          source={item.image} 
          style={{ width: '100%', height: 180 }}
          contentFit="cover" 
          transition={200} 
          cachePolicy="memory-disk" 
        />
        <View style={{ padding: 15, justifyContent: 'center' }}>
          
          <Text style={{ fontSize: moderateScale(18), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(5)}}>{item.title}</Text>
          <Text style={{ fontSize: moderateScale(13), color: Colors.darkGray }}>{item.description}</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: moderateScale(10) }}>
            
            {/* 2. Attach swipeLeft to the NOPE button */}
            <TouchableOpacity 
              style={{ padding: 12, borderRadius: 50, backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center' }} 
              onPress={swipeLeft} 
              hitSlop={5}
            >
              <MaterialIcons name="close" size={moderateScale(20)} color="#ffffff" />
            </TouchableOpacity>

            {/* 3. Attach swipeRight to the LIKE button */}
            <TouchableOpacity 
              style={{ padding: 12, borderRadius: 50, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' }} 
              onPress={swipeRight} 
              hitSlop={5}
            >
              <MaterialIcons name="check" size={moderateScale(20)} color="#ffffff" />
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}

export default function IdeaBoard() {
  const tripData = useTrip();
  const { ideaBoard = [], refreshTripData } = tripData;
  const [discoverItems, setDiscoverItems] = useState(ideaBoard);
  const [votingItems, setVotingItems] = useState([]);
  
  const renderDiscoverCard = useCallback(({ item, index, swipeLeft, swipeRight }) => {
    return <DiscoverCard item={item} swipeLeft={swipeLeft} swipeRight={swipeRight} />;
  }, []);

  return (
    <TripInfoScrollView onRefresh={refreshTripData} style={styles.container}>
      {/* Tab Bar */}
      <View style={{ padding: 10 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <ReusableTabBar 
            tabs={[
              { label: "Idea Board", name: "idea-board", route: `/(trip-info)/${tripData.tripId}/(plan)/idea-board` },
              { label: "Timeline", name: "timeline", route: `/(trip-info)/${tripData.tripId}/(plan)/timeline` },
              { label: "Map", name: "map", route: `/(trip-info)/${tripData.tripId}/(plan)/map` },
              { label: "Stays", name: "stays", route: `/(trip-info)/${tripData.tripId}/(plan)/stays` },
            ]}
          />
        </View>
      </View>

      <View style={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Discover New Ideas</Text>
          <DeckSwiper 
            data={discoverItems}
            renderItem={renderDiscoverCard}
            onSwipeLeft={(item) => console.log(`Swiped left on ${item.title}`)}
            onSwipeRight={(item) => {
              console.log(`Liked ${item.title}, moving to voting!`);
              // Add the swiped item to the end of the voting list
              setVotingItems((prevItems) => [...prevItems, item]);
            }}
          />

        <Text style={styles.sectionTitle}>Voting In Progress</Text>
        <View style={{ gap: 15, marginBottom: moderateScale(20) }}>
            {votingItems.length === 0 ? (
              <Text style={{ color: Colors.gray }}>Swipe right on some ideas to start voting!</Text>
            ) : (
              votingItems.map((item, index) => (
                <VotingInProgressCard key={item.id || index} item={item} />
              ))
            )}
        </View>
      </View>
    </TripInfoScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: '5%',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: moderateScale(10),
  },
  refreshButton: {
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  discoverCardContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: moderateScale(20),
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
  },
  discoverCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'white'
  }
});