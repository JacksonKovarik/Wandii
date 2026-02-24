import { Colors } from "@/src/constants/colors";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function Memories() {
  const { memories = [] } = useTrip();
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = screenWidth * 0.9;
  const cardSpacing = (screenWidth - cardWidth) / 2;

  const JournalCard = (props) => {
    return (
      <View 
        style={{ 
          width: cardWidth, 
          maxHeight: moderateScale(230),
          backgroundColor: 'white', 
          borderRadius: 20, 
          padding: '5%', 
          paddingHorizontal: '6%',
          marginBottom: '4%',
          shadowColor: Colors.darkBlue,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="event" size={moderateScale(14)} color={Colors.primary} />
            <Text 
              style={{ 
                fontSize: moderateScale(12), 
                fontWeight: '700', 
                color: Colors.textSecondaryDark 
              }}
            >Day {props.day} • {props.date}</Text>
          </View>

          <Text 
            style={{ 
              fontSize: moderateScale(12), 
              fontWeight: '800', 
              color: Colors.textSecondaryLight 
            }}
          >{props.time}</Text>

        </View>
        <Text
          style={{
            fontSize: moderateScale(16),
            fontWeight: '600',
            color: Colors.darkBlue,
            marginBottom: moderateScale(10)
          }}
          numberOfLines={1} // Limit title to 2 lines
          ellipsizeMode="tail"
        >Day {props.day} - {props.title}</Text>
        <Text
          style={{
            fontSize: moderateScale(12), color: Colors.textSecondaryDark, fontWeight: '500', marginBottom: moderateScale(10), lineHeight: moderateScale(18)
          }}
          numberOfLines={3} // Limit description to 2 lines
          ellipsizeMode="tail"
        >{props.description}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 'auto' }}>
          {props.images.map((img, index) => (
            <View key={index} style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: Colors.lightGray }} />
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Trip Journal Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
        <Text style={styles.sectionTitle}>Trip Journal</Text>
        <TouchableOpacity style={{ flexDirection: 'row', gap: 5 }}onPress={() => console.log('New journal entry pressed')}>
          <MaterialIcons name="add" size={moderateScale(16)} color={Colors.primary} />
          <Text style={styles.newEntryButton}>New Entry</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={memories}
        renderItem={({ item }) => <JournalCard {...item} />}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: '' }} // Set a fixed height for the FlatList
        snapToInterval={cardWidth + cardSpacing}
        decelerationRate="fast"
        contentContainerStyle={{
          gap: cardSpacing,
        }}
      />

      {/* Shared Album Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: moderateScale(20) }}>
        <Text style={styles.sectionTitle}>Shared Album</Text>
        <TouchableOpacity onPress={() => console.log('View shared album pressed')}>
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Shared Album Content */}
      <TouchableOpacity style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, overflow: 'hidden', borderRadius: 20 }}>
        <LinearGradient
          style={styles.gradient}
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          locations={[0.30, .9]}
        >
          <View 
            style={{ 
              padding: '20%',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
            }}
          >
            <View style={{ alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="cloud-upload" size={moderateScale(26)} color="white" />
              <Text
                style={{
                  color: 'white',
                  fontSize: moderateScale(14),
                  fontWeight: '700',
                }}
              >Tap to upload image</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.albumImage} />
        <View style={styles.albumImage} />
        <View style={styles.albumImage} />
        <View style={styles.albumImage} />
        <View style={styles.albumImage} />
        <View style={styles.albumImage} />
      </TouchableOpacity>
    </ScrollView>
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
  },
  newEntryButton: {
    fontSize: moderateScale(13),
    color: Colors.primary,
    fontWeight: 'bold',
  },
  viewAllButton: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  albumImage: {
    width: moderateScale(105),
    height: moderateScale(105),
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
  },
  });
