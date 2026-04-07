import { Colors } from "@/src/constants/colors";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import InAppNotification from "@/src/components/inAppNotification";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';

import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { useTrip } from "@/src/utils/TripContext";
import { useRouter } from "expo-router";

// --- Helper: Convert Open-Meteo WMO Codes to MaterialIcons & Colors ---
const getWeatherDetails = (wmoCode) => {
  if (wmoCode === 0) return { icon: 'wb-sunny', color: '#FFD700' }; // Clear sky (Gold)
  if (wmoCode >= 1 && wmoCode <= 3) return { icon: 'cloud', color: '#B0BEC5' }; // Cloudy/Overcast (Blue-Grey)
  if (wmoCode >= 45 && wmoCode <= 48) return { icon: 'foggy', color: '#9E9E9E' }; // Fog (Grey)
  if (wmoCode >= 51 && wmoCode <= 67) return { icon: 'water-drop', color: '#4FC3F7' }; // Rain/Drizzle (Light Blue)
  if (wmoCode >= 71 && wmoCode <= 77) return { icon: 'ac-unit', color: '#E0F7FA' }; // Snow (Icy White/Blue)
  if (wmoCode >= 80 && wmoCode <= 82) return { icon: 'umbrella', color: '#29B6F6' }; // Rain showers (Blue)
  if (wmoCode >= 95 && wmoCode <= 99) return { icon: 'thunderstorm', color: '#7E57C2' }; // Thunderstorm (Deep Purple)
  
  return { icon: 'cloud', color: '#B0BEC5' }; // Default fallback
};

const weatherCache = {
  data: null,
  timestamp: 0,
  coordsKey: null
};
const CACHE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function Overview() {
  const tripData = useTrip();
  const { takeoffDays, weather: defaultWeather, readinessPercent, notifications, notificationList, group, refreshTripData } = tripData;

  const router = useRouter();

  // Set up state for our live weather UI, using the default data initially
  const [liveWeather, setLiveWeather] = useState({
    temp: defaultWeather?.temp || '--',
    location: defaultWeather?.location || 'TBD',
    icon: defaultWeather?.icon || 'wb-sunny'
  });
  
  const notificationAction = (title) => {
    if (title === "Ready to Schedule") {
        return {theme: 'action', icon: 'calendar-today', onPress: () => router.navigate("/(plan)/timeline")};
    } else if (title === "Payment Due") {
        return {theme: 'urgent', icon: 'payment', onPress: () => router.navigate("/payments")};
    } else if (title === "New Ideas to Explore") {
        return {theme: 'info', icon: 'lightbulb', onPress: () => router.navigate("/(plan)/idea-board")};
    } 
  }

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let lat, lon, locationName;

        // 1. DETERMINE WHICH COORDINATES TO USE (Keep this exactly the same)
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
          console.log("🌤️ Loaded weather from 10-minute cache!");
          setLiveWeather(weatherCache.data);
          return; // Stop here! Don't hit the API.
        }

        // 2. FETCH FROM OPEN-METEO
        console.log("☁️ Fetching fresh weather from API...");
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`
        );
        const data = await response.json();

        // 3. FORMAT AND SAVE TO CACHE
        if (data && data.current_weather) {
          
          // 🎨 NEW: Get both the icon and the color from our new helper
          const { icon, color } = getWeatherDetails(data.current_weather.weathercode);

          const newWeatherData = {
            temp: Math.round(data.current_weather.temperature),
            location: locationName,
            icon: icon,   // Use the destructured icon
            color: color  // Save the destructured color to state/cache
          };

          // Save it in our global cache for the next 10 minutes
          weatherCache.coordsKey = currentCoordsKey;
          weatherCache.data = newWeatherData;
          weatherCache.timestamp = now;

          // Update the UI
          setLiveWeather(newWeatherData);
        }
      } catch (error) {
        console.error("Failed to fetch live weather:", error);
      }
    };
    fetchWeather();
  }, [takeoffDays, defaultWeather]); // Re-run if these change

  return (
  <View style={{ flex: 1 }}>
    
    <TripInfoScrollView
      onRefresh={refreshTripData}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >

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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.sectionTitle}>The Group</Text>
          <TouchableOpacity onPress={() => console.log("Manage group pressed")}>
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
              <View
                style={[
                  styles.avatar,
                  { borderColor: member.active ? Colors.success : Colors.textSecondaryLight },
                ]}
              >
                {member.profilePic ? (
                  <Image
                    source={{ uri: member.profilePic }}
                    style={{
                      width: moderateScale(50),
                      height: moderateScale(50),
                      borderRadius: moderateScale(25),
                    }}
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

              <Text style={[styles.memberName, { fontWeight: member.active ? "bold" : "normal" }]}>
                {member.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.memberItem} onPress={() => console.log("Add member pressed")}>
            <View style={[styles.avatar, { borderColor: Colors.textSecondaryLight, borderStyle: "dashed" }]}>
              <View style={styles.avatarContent}>
                <MaterialIcons name="add" size={moderateScale(24)} color={Colors.textSecondaryLight} />
              </View>
            </View>
            <Text style={styles.memberName}>Invite</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TripInfoScrollView>

    {/* Button to navigate to trip chat; floating */}
    <ChatNav onPress={() => router.push(`/(trip-info)/${tripData.id}/chat`)} />

  </View>
);

}