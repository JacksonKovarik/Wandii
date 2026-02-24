import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

import InAppNotification from "@/src/components/inAppNotification";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import React from 'react';

import { useTrip } from "@/src/utils/TripContext";

export default function Overview() {
  const tripData = useTrip();
  const { takeoffDays, weather, readinessPercent, notifications, group } = tripData;

  return (
    <ScrollView style={styles.container}>
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
              <MaterialIcons name={weather.icon} size={moderateScale(24)} color="#FFD700" />
              <Text style={styles.temperature}>{weather.temp}°</Text>
            </View>
            <Text style={styles.location}>{weather.location}</Text>
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
        {notifications.map((notification) => (
          <InAppNotification key={notification.id} {...notification} />
        ))}
      </View>

      {/* The Group */}
      <View style={styles.groupSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>The Group</Text>
          <TouchableOpacity onPress={() => console.log('Manage group pressed')}>
            <Text style={styles.manageButton}>Manage</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} contentContainerStyle={styles.groupContainer}>

          {[...group].sort((a, b) => b.active - a.active).map((member) => (
            <TouchableOpacity 
              key={member.id} 
              style={styles.memberItem}
              onPress={() => {console.log(`Member ${member.name} pressed`);}}
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

          <TouchableOpacity 
            style={styles.memberItem}
            onPress={() => {console.log('Add member pressed');}}
          >
            <View style={[styles.avatar, { borderColor: Colors.textSecondaryLight, borderStyle: 'dashed' }]}>
              <View style={ styles.avatarContent } >
                <MaterialIcons name="add" size={moderateScale(24)} color={Colors.textSecondaryLight} />
              </View>
            </View>
            <Text style={styles.memberName}>Invite</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
  },
  headerCard: {
    // minHeight: '32%',
    marginBottom: moderateScale(20),
    backgroundColor: '#000D24',
    borderRadius: 15,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(18),
    shadowColor: '#0B1221',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: Colors.textSecondaryLight,
  },
  largeText: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    marginTop: moderateScale(5),
    color: '#ffffff',
  },
  smallText: {
    fontSize: moderateScale(14),
    color: Colors.textSecondaryLight,
  },
  weatherCard: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(10),
    justifyContent: 'space-around',
    gap: moderateScale(5),
    borderWidth: moderateScale(0.5),
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
  },
  temperature: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  location: {
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
  
});