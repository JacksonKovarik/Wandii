import TripInfoTabBar from "@/src/components/trip-info/tripInfoTabBar";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { useTripDashboard } from "@/src/hooks/useTripDashboard";
import { supabase } from "@/src/lib/supabase";
import DateUtils from "@/src/utils/DateUtils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs, useNavigation, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// 1. Swap your context import for your new TanStack hook

// ==========================================
// HELPER COMPONENTS
// ==========================================
const HeaderButton = ({ icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <BlurView
      intensity={10}
      tint="default"
      style={{
        width: 34,
        height: 34,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <MaterialIcons name={icon} size={moderateScale(22)} color="white" />
    </BlurView>
  </TouchableOpacity>
);

// 2. CustomHeader now consumes the hook directly instead of receiving props!
const CustomHeader = () => {
    const router = useRouter();
    const navigation = useNavigation();
    
    // Pull exactly what we need from the cache instantly
    const { tripId, image, name, startDate, endDate } = useTripDashboard();

    const goBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.replace('/'); 
        }
    };

    return (
        <View style={styles.headerContainer}>
            <Image source={image} style={styles.gradient} contentFit='cover' cachePolicy='memory-disk' />
            <LinearGradient style={styles.gradient} colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.6)', 'rgba(0,0,0,0.8)']} locations={[0, 0.49, 0.78, 1]} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '5%', paddingTop: moderateScale(65) }}>
                <HeaderButton icon="arrow-back" onPress={goBack}/>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                    <HeaderButton icon="settings" onPress={() => router.navigate(`/(trip-info)/${tripId}/(settings)/settings`)} />
                </View>
            </View>
            
            <View style={ styles.contentWrapper }>
                <View style={ styles.spacer } />
                <View style={ styles.textContainer }>
                    <Text style={ styles.destination } numberOfLines={2}>{ name }</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
                        <MaterialIcons name="calendar-today" size={moderateScale(12)} color="white" />
                        <Text style={ styles.dateRange }>
                          { DateUtils.formatRange(DateUtils.parseYYYYMMDDToDate(startDate), DateUtils.parseYYYYMMDDToDate(endDate)) }
                        </Text>
                    </View>
                </View>
            </View>
            <TripInfoTabBar tripId={ tripId }/>
        </View>
  );
};

export default function TripTabsLayout() {
  const tripData = useTripDashboard();
  const { user } = useAuth();
  const pathname = usePathname();
  const [hasUnreadChats, setHasUnreadChats] = useState(false);

  if (!tripData) return null;

  const isChatOpen = pathname.endsWith("/chat");

  const handleOpenChat = () => {
    setHasUnreadChats(false);
    router.push(`/(trip-info)/${tripData.id}/chat`);
  };

  useEffect(() => {
    if (isChatOpen) {
      setHasUnreadChats(false);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (!tripData?.id || !user?.id) return undefined;

    const channel = supabase
      .channel(`trip-chat-badge-${tripData.id}-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `trip_id=eq.${tripData.id}`,
        },
        (payload) => {
          const senderId = payload?.new?.sender_id;

          if (senderId && senderId !== user.id && !isChatOpen) {
            setHasUnreadChats(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripData?.id, user?.id, isChatOpen]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <CustomHeader trip={tripData} />

      <Tabs screenOptions={{ tabBarStyle: { display: "none" }, headerShown: false, unmountOnBlur: true }}>
        <Tabs.Screen name="overview" options={{ title: "Overview" }} />
        <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
        <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
        <Tabs.Screen name="docs" options={{ title: "Docs" }} />
        <Tabs.Screen name="memories" options={{ title: "Memories" }} />
        <Tabs.Screen name="album" options={{ headerShown: false }} />
      </Tabs>

      <TouchableOpacity onPress={handleOpenChat} style={styles.chatButton}>
        <Ionicons name="chatbubble-ellipses" size={35} color="white" />
        {hasUnreadChats && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { height: "39%" },
  imageBackground: { flex: 1 },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: moderateScale(40),
    paddingBottom: moderateScale(28),
  },
  spacer: { flex: 1 },
  textContainer: { gap: 4 },
  destination: {
    color: "white",
    fontSize: moderateScale(25),
    fontWeight: "bold",
    maxWidth: "60%",
  },
  dateRange: {
    color: "white",
    fontSize: moderateScale(12),
    marginTop: 4,
  },
  chatButton: {
    position: "absolute",
    bottom: 50,
    right: 40,
    backgroundColor: Colors.darkBlue,
    height: 70,
    width: 70,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  unreadBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.danger || "red",
    borderWidth: 2,
    borderColor: Colors.darkBlue,
  },
});
