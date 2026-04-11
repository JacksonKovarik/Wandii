import { GroupDisplay } from "@/src/components/GroupDisplay";
import ProgressBar from "@/src/components/progressBar";
import { Colors } from "@/src/constants/colors";
import DateUtils from "@/src/utils/DateUtils";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";


export const UpcomingTripCard = ({ trip, onDelete, isCreator }) => {
  const router = useRouter();
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80";
  const imageSource =
    typeof trip.cover_photo_url === "string" ? { uri: trip.cover_photo_url } : { uri: FALLBACK_IMAGE };


  const takeoffDays = DateUtils.calculateDaysUntil(
    DateUtils.parseYYYYMMDDToDate(trip.start_date)
  );
  const group = trip.Trip_Members
  const percent = trip.readinessPercent ?? 60;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(trip-info)/${trip.id}/overview`)}
    >
      <Image
        source={imageSource}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={styles.cardImage}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", position: "absolute", top: 10, left: 10, right: 10 }}>
        {/* location tag */}
        <View style={[styles.subtitleRow]}>
            <BlurView
            intensity={20}
            tint="default"
            style={{
                position: "absolute",
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.38)",
                overflow: "hidden",
            }}
            />
            <MaterialCommunityIcons
            name="map-marker-outline"
            size={moderateScale(14)}
            color="white"
            />
            <Text style={styles.cardSubtitle}>{trip.destination}</Text>
        </View>
        
        {/* countdown pill */}
        <View style={styles.countdownPill}>
            <Ionicons
                name="time-outline"
                size={moderateScale(12)}
                color="#FF5900"
                style={{ marginRight: scale(4) }}
            />
            <Text style={styles.countdownText}>{takeoffDays} days</Text>
        </View>
      </View>

      {/* card content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{trip.title}</Text>

        {/* date range */}
        <View style={styles.dateRow}>
          <MaterialCommunityIcons
            name="calendar-today"
            size={moderateScale(14)}
            color={Colors.textSecondary}
          />
          <Text style={styles.dateRange}>
            {DateUtils.formatRange(
              DateUtils.parseYYYYMMDDToDate(trip.start_date),
              DateUtils.parseYYYYMMDDToDate(trip.end_date)
            )}
          </Text>
        </View>

        {/* status */}
        <View style={styles.progressHeader}>
          <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
            Status
          </Text>
          <Text style={[styles.progressText, { color: Colors.primary }]}>
            {takeoffDays === 0
              ? "Trip is starting"
              : `Takeoff in ${takeoffDays} day${takeoffDays === 1 ? "" : "s"}`}
          </Text>
        </View>

        {/* progress bar */}
        <ProgressBar
          width="100%"
          height={moderateScale(8)}
          progress={`${percent}%`}
          backgroundColor="#F3F3F3"
        />

        <View style={styles.divider} />

        {/* group avatars */}
        <GroupDisplay members={group || []} />

        {/* menu */}
        <View style={styles.menuWrap}>
          <Menu>
            <MenuTrigger style={{ padding: 10 }}>
              <MaterialIcons name="more-vert" size={moderateScale(20)} color="grey" />
            </MenuTrigger>
            <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
              <MenuOption
                onSelect={() => onDelete(trip.id)}
                customStyles={{
                  optionWrapper: {
                    padding: 10,
                  },
                }}
              >
                {isCreator ? (
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialIcons name="delete-outline" size={20} color="red" />
                    <Text style={{ fontSize: moderateScale(14), color: "red", fontWeight: "600" }}>
                      Delete
                    </Text>
                  </View>
                ): (
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialIcons name="exit-to-app" size={20} color="red" />
                    <Text style={{ fontSize: moderateScale(14), color: "red", fontWeight: "600" }}>
                      Leave
                    </Text>
                  </View>
                )}
                
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: moderateScale(25),
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(5),
    elevation: 4,
    overflow: "hidden",
  },

  cardImage: { width: "100%", height: 130 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 24, fontWeight: "bold", color: "black" },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.43)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 20,
    paddingHorizontal: moderateScale(5),
    paddingVertical: moderateScale(4),
    gap: moderateScale(4),
  },

  cardSubtitle: {
    fontSize: moderateScale(12),
    color: "white",
    fontWeight: "600",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },

  dateRange: {
    color: Colors.textSecondaryDark,
    fontSize: moderateScale(12),
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  divider: {
    width: "100%",
    height: 0.7,
    backgroundColor: "#CFCFCF",
    marginVertical: 20,
  },

  menuWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  menuOptionsContainer: {
    borderRadius: 10,
    padding: 5,
    width: 120,
    marginTop: 20,
  },

  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: scale(10),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: "#FF5900",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  countdownText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#FF5900",
  },
});