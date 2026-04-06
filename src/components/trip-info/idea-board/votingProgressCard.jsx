import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import { getCategoryFallback } from "@/src/constants/TripConstants";

// We use 'export const' so it matches your named import { VotingInProgressCard }
export const VotingInProgressCard = ({ item, group }) => {
  const currentVotes = item.event_votes || [];
  const yesVotes = currentVotes.reduce((sum, vote) => sum + (vote.vote_value === 1 ? 1 : 0), 0);  
  
  const activeGroupSize = group.length;
  const requiredVotes = Math.floor(activeGroupSize / 2) + 1;
  const fallback = getCategoryFallback(item.category);
  
  const progressPercentage = requiredVotes > 0 ? `${Math.min((yesVotes / requiredVotes) * 100, 100)}%` : '0%';

  return (
    <View style={styles.votingCardContainer}>
      {item.image_url ? (
        <Image 
          source={item.image_url} 
          style={styles.votingCardImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ):(
        <LinearGradient colors={fallback.colors} style={[ styles.votingCardImage, { alignItems: 'center', justifyContent: 'center' } ]}>
          <MaterialIcons name={fallback.icon} size={24} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      )}
      
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.category} • $$</Text>
        <View style={{ marginTop: moderateScale(8) }}>
          <ProgressBar 
            width={'100%'} 
            height={moderateScale(6)} 
            progress={progressPercentage} 
            progressColor={Colors.success} 
          />
          <View style={styles.progressTextRow}>
            <Text style={styles.progressText}>{yesVotes}/{requiredVotes} Needed</Text>
            <Text style={styles.progressText}>Waiting on group</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  votingCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(12),
    borderRadius: moderateScale(16),
    marginBottom: moderateScale(12),
    // Subtle shadow to match your modern UI
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  votingCardImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(12),
    marginRight: moderateScale(14),
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: moderateScale(2),
  },
  cardSubtitle: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(6),
  },
  progressText: {
    fontSize: moderateScale(11),
    color: Colors.textSecondaryLight,
    fontWeight: '600',
  }
});