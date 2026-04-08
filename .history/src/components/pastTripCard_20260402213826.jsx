import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

const PastTripCard = ({ trip, onRelivePress }) => {
  return (
    <View style={styles.card}>

      {/* Top section: image + trip info */}
      <View style={styles.topRow}>

        {/* Trip cover image */}
        <Image source={trip.image} style={styles.coverImage} />

        {/* Right side text column */}
        <View style={styles.textColumn}>

          {/* Trip location */}
          <Text style={styles.location}>{trip.location}</Text>

          {/* Trip dates with calendar icon */}
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={moderateScale(20)}
              color="#9d9d9d"
              style={{ marginRight: scale(6) }}
            />
            <Text style={styles.dates}>{trip.dates}</Text>
          </View>

          {/* Photos + Journals stacked vertically */}
          <View style={styles.infoColumn}>

            {/* Photos pill */}
            <View style={[styles.details, styles.photoDetails]}>
              <Ionicons
                name="image-outline"
                size={moderateScale(12)}
                color="#9900FF"
                style={{ marginRight: scale(4) }}
              />
              <Text style={[styles.detailText, { color: '#9900FF' }]}>
                {trip.photos} Photos
              </Text>
            </View>

            {/* Journals pill */}
            <View style={[styles.details, styles.journalDetails]}>
              <Ionicons
                name="book-outline"
                size={moderateScale(12)}
                color="#FF5900"
                style={{ marginRight: scale(4) }}
              />
              <Text style={[styles.detailText, { color: '#FF5900' }]}>
                {trip.journals} Journals
              </Text>
            </View>
          </View>

          {/* Route Map pill */}
          <View style={styles.routeDetails}>
            <Ionicons
              name="map-outline"
              size={moderateScale(12)}
              color="#0051FF"
              style={{ marginRight: scale(4) }}
            />
            <Text style={[styles.detailText, { color: '#0051FF' }]}>
              Route Map
            </Text>
          </View>

        </View>
      </View>

      {/* Bottom buttons: Relive Trip + Share */}
      <View style={styles.buttonRow}>

        {/* Relive Trip button */}
        <TouchableOpacity style={styles.reliveButton} onPress={onRelivePress}>
          <Text style={styles.reliveText}>Relive Trip</Text>
        </TouchableOpacity>

        {/* Share button */}
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