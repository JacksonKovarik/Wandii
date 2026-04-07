import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import InAppNotification from "@/src/components/inAppNotification";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';

import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { useTrip } from "@/src/utils/TripContext";
import { useRouter } from "expo-router";
import ChatNav from "@/src/components/chatNav";   // ⭐ ADD THIS

// --- Helper: Convert Open-Meteo WMO Codes to MaterialIcons & Colors ---
const getWeatherDetails = (wmoCode) => {
  if (wmoCode === 0) return { icon: 'wb-sunny', color: '#FFD700' };
  if (wmoCode >= 1 && wmoCode <= 3) return { icon: 'cloud', color: '#B0BEC5' };
  if (wmoCode >= 45 && wmoCode <= 48) return { icon: 'foggy', color: '#9E9E9E' };
  if (wmoCode >= 51 && wmoCode <= 67) return { icon: 'water-drop', color: '#4FC3F7' };
  if (wmoCode >= 71 && wmoCode <= 77) return { icon: 'ac-unit', color: '#E0F7FA' };
  if (wmoCode >= 80 && wmoCode <= 82) return { icon: 'umbrella', color: '#29B6F6' };
  if (wmoCode >= 95 && wmoCode <= 99) return { icon: 'thunderstorm', color: '#7E57C2' };
  return { icon: 'cloud', color: '#B0BEC5' };
};

const weatherCache = {
  data: null,
  timestamp: 0,
  coordsKey: null
};
const CACHE_LIMIT_MS = 10 * 60 * 1000;

export default function Overview() {
  const tripData = useTrip();
  const { takeoffDays, weather: defaultWeather, readinessPercent, notifications, notificationList, group, refreshTripData } = tripData;

  const router = useRouter();

  const [liveWeather, setLiveWeather] = useState({
    temp: defaultWeather?.temp || '--',
    location: defaultWeather?.location || 'TBD',
    icon: defaultWeather?.icon || 'wb-sunny'
  });

  const notificationAction = (title) => {
    if (title === "Ready to Schedule") {
      return { theme: 'action', icon: 'calendar-today', onPress: () => router.navigate("/(plan)/timeline") };
    } else if (title === "Payment Due") {
      return { theme: 'urgent', icon: 'payment', onPress: () => router.navigate("/payments") };
    } else if (title === "New Ideas to Explore") {
      return { theme: 'info', icon: 'lightbulb', onPress: () => router.navigate("/(plan)/idea-board") };
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let lat, lon, locationName;

        if (takeoffDays > 0) {
          if (!defaultWeather?.coordinates) return;
          lat = defaultWeather.coordinates.latitude;
          lon = defaultWeather.coordinates.longitude;
          locationName = defaultWeather.location;
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            lat = defaultWeather?.coordinates?.latitude;
            lon = defaultWeather?.coordinates?.longitude;
            locationName = defaultWeather?.location;
          } else {
            const location = await Location.getCurrentPositionAsync({});
            lat = location.coords.latitude;
            lon = location.coords.longitude;
            locationName = "Current Location";
          }
        }

        if (!lat || !lon) return;

        const currentCoordsKey = `${lat},${lon}`;
        const now = Date.now();

        if (
          weatherCache.coordsKey === currentCoordsKey &&
          weatherCache.data &&
          (now - weatherCache.timestamp) < CACHE_LIMIT_MS
        ) {
          setLiveWeather(weatherCache.data);
          return;
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`
        );
        const data = await response.json();

        if (data && data.current_weather) {
          const { icon, color } = getWeatherDetails(data.current_weather.weathercode);

          const newWeatherData = {
            temp: Math.round(data.current_weather.temperature),
            location: locationName,
            icon,
            color
          };

          weatherCache.coordsKey = currentCoordsKey;
          weatherCache.data = newWeatherData;
          weatherCache.timestamp = now;

          setLiveWeather(newWeatherData);
        }
      } catch (error) {
        console.error("Failed to fetch live weather:", error);
      }
    };
    fetchWeather();
  }, [takeoffDays, defaultWeather]);

  return (
    <View style={{ flex: 1 }}>  
      {/* ⭐ WRAP EVERYTHING IN A FLEX CONTAINER */}

      <TripInfoScrollView
        onRefresh={refreshTripData}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.subtitle}>Takeoff In</Text>
              <Text style={styles.largeText}>
                {takeoffDays}<Text style={styles.smallText}> days</Text>
              </Text>
            </View>

            <View style={styles.weatherCard}>
              <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
              <View style={styles.weatherContent}>
                <MaterialIcons
                  name={liveWeather?.icon || 'wb-sunny'}
                  size={moderateScale(24)}
                  color={liveWeather?.color || '#FFFFFF'}
                />
                <Text style={styles.temperature}>{liveWeather.temp}°</Text>
              </View>
              <Text style={styles.location}>{liveWeather.location}</Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Trip Readiness</Text>
            <Text style={styles.progressPercent}>{readinessPercent}% Ready</Text>
          </View>
          <ProgressBar width="100%" height={moderateScale(8)} progress={`${readinessPercent}%`} backgroundColor="rgba(255,255,255,0.3)" />
        </View>

        {/* Action Required */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Action Required</Text>
          {notifications && notificationList.length > 0 ? (
            <View style={styles.notificationsContainer}>
              {notificationList.map((notif) => {
                const action = notificationAction(notif.title);
                return (
                  <InAppNotification
                    key={notif.id}
                    icon={action.icon}
                    title={notif.title}
                    description={notif.message}
                    type={action.theme}
                    onPress={action.onPress}
                  />
                );
              })}
            </View>
          ) : (
            <Text>Nothing Happening</Text>
          )}
        </View>

        {/* The Group */}
        <View style={styles.groupSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>The Group</Text>
            <TouchableOpacity onPress={() => console.log('Manage group pressed')}>
              <Text style={styles.manageButton}>Manage</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.groupContainer}
          >
            {[...group].sort((a, b) => b.active - a.active).map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => console.log(`Member ${member.name} pressed`)}
              >
                <View style={[styles.avatar, { borderColor: member.active ? Colors.success : Colors.textSecondaryLight }]}>
                  {member.profilePic ? (
                    <Image
                      source={{ uri: member.profilePic }}
                      style={{ width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(25) }}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarContent,
                        { backgroundColor: member.active ? member.profileColor : Colors.textSecondaryLight },
                      ]}
                    >
                      <Text style={styles.initials}>{member.initials}</Text>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: member.active ? Colors.success : Colors.textSecondaryLight },
                  ]}
                />

                <Text style={[styles.memberName, { fontWeight: member.active ? 'bold' : 'normal' }]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.memberItem} onPress={() =>: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: Colors.textSecondaryLight,
    alignSelf: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(10),
  },
  progressLabel: {
    fontSize: moderateScale(12),
    color: Colors.textSecondaryLight,
    fontWeight: 'bold',
  },
  progressPercent: {
    fontSize: moderateScale(12),
    color: Colors.success,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: Colors.textSecondaryDark,
  },
  actionSection: {
    gap: moderateScale(10),
  },
  groupContainer: {
    flexDirection: 'row',
    gap: moderateScale(15),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(50),
  },
  memberItem: {
    alignItems: 'center',
  },
  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    borderWidth: moderateScale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContent: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
  },
  statusIndicator: {
    position: 'absolute',
    bottom: moderateScale(24),
    right: moderateScale(2),
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(7),
    borderWidth: moderateScale(1.5),
    borderColor: Colors.background,
    zIndex: 10,
  },
  memberName: {
    marginTop: moderateScale(5),
    fontSize: moderateScale(12),
    color: Colors.textSecondaryDark,
  },
  groupSection: {
    marginTop: moderateScale(20),
  },
  manageButton: {
    fontSize: moderateScale(13),
    color: Colors.success,
    fontWeight: 'bold',
  },
  notificationsContainer: {
    marginTop: moderateScale(16),
    gap: moderateScale(8),
  },
});