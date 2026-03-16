import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const PastTripCard = ({ trip, onRelivePress }) => {
  return (
    <View style={styles.card}>

      <View style={styles.topRow}>
        <Image source={trip.image} style={styles.coverImage} />

        <View style={styles.textColumn}>
          <Text style={styles.location}>{trip.location}</Text>

          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={moderateScale(20)}
              color="#9d9d9d"
              style={{ marginRight: scale(6) }}
            />
            <Text style={styles.dates}>{trip.dates}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.details, styles.photoDetails]}>
              <Text style={[styles.detailText, { color: '#9900FF' }]}>
                {trip.photos} Photos
              </Text>
            </View>

            <View style={[styles.details, styles.journalDetails]}>
              <Text style={[styles.detailText, { color: '#FF5900' }]}>
                {trip.journals} Journals
              </Text>
            </View>
          </View>

          <View style={styles.routeDetails}>
            <Text style={[styles.detailText, { color: '#0051FF' }]}>
              Route Map
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.reliveButton} onPress={onRelivePress}>
          <Text style={styles.reliveText}>Relive Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <View style={styles.shareContent}>
            <Ionicons
              name="share-social"
              size={moderateScale(20)}
              color="white"
              style={{ marginRight: scale(6) }}
            />
            <Text style={styles.shareText}>Share</Text>
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default PastTripCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(16),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(5),
    elevation: 4,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },

  coverImage: {
    width: scale(100),
    height: verticalScale(130),
    borderRadius: scale(10),
    marginRight: scale(16),
  },

  textColumn: {
    flex: 1,
  },

  location: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(6),
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },

  dates: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#9d9d9d',
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(6),
  },

  details: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: scale(8),
    marginRight: scale(8), 
  },

  photoDetails: {
    backgroundColor: '#EDD9FF',
  },

  journalDetails: {
    backgroundColor: '#FFE6C4',
  },

  routeDetails: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: scale(8),
    backgroundColor: '#BFD9FF',
    alignSelf: 'flex-start',
    marginTop: verticalScale(2),
  },

  detailText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
  },

  reliveButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: verticalScale(12),
    borderRadius: scale(10),
    alignItems: 'center',
    marginRight: scale(12), // replaces gap
  },

  reliveText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#000',
  },

  shareButton: {
    flex: 1,
    backgroundColor: '#6193FF',
    paddingVertical: verticalScale(4),
    justifyContent: 'center',
    borderRadius: scale(10),
    alignItems: 'center',
  },

  shareText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: 'white',
  },

  shareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

