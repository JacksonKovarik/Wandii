import TripInfoTabBar from "@/src/components/tripInfoTabBar";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { getTripById } from "@/src/lib/trips";
import DateUtils from "@/src/utils/DateUtils";
import { TripContext } from "@/src/utils/TripContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

const FALLBACK_IMAGE = require("../../../../assets/images/Kyoto.jpg");
const IDEA_IMAGE = require("../../../../assets/images/paris.png");

function getUserLabel(user) {
  if (!user?.email) return "You";
  return user.email.split("@")[0];
}

function getInitials(value) {
  return String(value || "You")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "YU";
}

function calculateTakeoffDays(startDate) {
  if (!startDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T12:00:00`);
  return Math.max(0, Math.ceil((start - today) / 86400000));
}

function buildTripTemplate(row, user) {
  const displayName = getUserLabel(user);
  const startDate = row?.start_date || new Date().toISOString().split("T")[0];
  const endDate = row?.end_date || startDate;
  const takeoffDays = calculateTakeoffDays(startDate);
  const budget = Number(row?.budget_estimate || 0);

  return {
    tripId: String(row?.id ?? "temp-trip"),
    id: String(row?.id ?? "temp-trip"),
    name: row?.title || "Untitled Trip",
    title: row?.title || "Untitled Trip",
    takeoffDays,
    destination: row?.destination || "Unknown destination",
    startDate,
    endDate,
    image: row?.cover_photo_url ? { uri: row.cover_photo_url } : FALLBACK_IMAGE,
    weather: { temp: 72, location: row?.destination || "Trip", icon: "wb-sunny" },
    readinessPercent: takeoffDays <= 3 ? 90 : takeoffDays <= 14 ? 70 : takeoffDays <= 30 ? 50 : 30,
    notifications: [
      {
        id: 1,
        title: row?.vibe ? `${row.vibe} vibe set` : "Trip details saved",
        description: budget > 0 ? `Budget estimate: $${Math.round(budget)}` : "Start adding plans, docs, and memories.",
        icon: "mail",
        color: Colors.primary,
        lightColor: Colors.primaryLight,
      },
    ],
    group: [
      {
        id: String(user?.id || "me"),
        name: displayName,
        initials: getInitials(displayName),
        profileColor: "#32CD32",
        profilePic: null,
        active: true,
      },
    ],
    budgetData: { totalSpent: 0, totalBudget: budget || 0 },
    groupBalances: [
      {
        id: String(user?.id || "me"),
        name: displayName,
        balance: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF8820&color=fff`,
      },
    ],
    transactions: [],
    timelineData: {
      [startDate]: [
        {
          id: "1",
          time: "10:00 AM",
          title: "Arrival / first plan",
          category: "Travel",
          type: "event",
        },
      ],
    },
    staysData: [],
    documents: [],
    ideaBoard: [
      {
        id: "1",
        title: "Welcome dinner",
        description: `Pick a first-night spot in ${row?.destination || "your destination"}.`,
        category: "Food",
        image: IDEA_IMAGE,
        votes: {},
        status: "voting",
      },
      {
        id: "2",
        title: "Must-do activity",
        description: "Add the one experience everyone wants on this trip.",
        category: "Fun",
        image: IDEA_IMAGE,
        votes: {},
        status: "voting",
      },
    ],
    memories: [],
  };
}

async function fetchTripData(tripId, userId, user) {
  if (!tripId || !userId) return buildTripTemplate(null, user);

  try {
    const data = await getTripById(userId, tripId);

    if (!data) {
      console.warn("Could not load trip detail:", "Trip not found");
      return buildTripTemplate({ id: tripId }, user);
    }

    return buildTripTemplate(data, user);
  } catch (error) {
    console.warn("Could not load trip detail:", error?.message || "Trip not found");
    return buildTripTemplate({ id: tripId }, user);
  }
}

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

const CustomHeader = ({ trip }) => (
  <View style={styles.headerContainer}>
    <Image source={trip.image} style={styles.gradient} contentFit="cover" cachePolicy="memory-disk" />
    <LinearGradient
      style={styles.gradient}
      colors={["rgba(0,0,0,0)", "rgba(0,0,0,.2)", "rgba(0,0,0,.6)", "rgba(0,0,0,0.8)"]}
      locations={[0, 0.49, 0.78, 1]}
    />

    <View style={styles.headerButtons}>
      <HeaderButton icon="arrow-back" onPress={() => router.back()} />
      <View style={styles.headerButtonRow}>
        <HeaderButton icon="search" onPress={() => console.log("search")} />
        <HeaderButton icon="settings" onPress={() => router.navigate(`/(trip-info)/${trip.id}/settings`)} />
      </View>
    </View>

    <View style={styles.contentWrapper}>
      <View style={styles.spacer} />
      <View style={styles.textContainer}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <View style={styles.dateRow}>
          <MaterialIcons name="calendar-today" size={moderateScale(12)} color="white" />
          <Text style={styles.dateRange}>
            {DateUtils.formatRange(
              DateUtils.parseYYYYMMDDToDate(trip.startDate),
              DateUtils.parseYYYYMMDDToDate(trip.endDate)
            )}
          </Text>
        </View>
      </View>
    </View>
    <TripInfoTabBar tripId={trip.id} />
  </View>
);

export default function TripInfoLayout() {
  const { user } = useAuth();
  const { tripId } = useLocalSearchParams();
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const CURRENT_USER_ID = String(user?.id || "me");

  useEffect(() => {
    let mounted = true;

    async function loadTrip() {
      if (!tripId || !user?.id) return;
      setIsLoading(true);
      const data = await fetchTripData(tripId, user.id, user);
      if (mounted) {
        setTripData(data);
        setIsLoading(false);
      }
    }

    loadTrip();
    return () => {
      mounted = false;
    };
  }, [tripId, user]);

  const refreshTripData = async () => {
    if (!tripId || !user?.id) return;
    const freshData = await fetchTripData(tripId, user.id, user);
    setTripData((prev) => ({ ...prev, ...freshData }));
  };

  const discoverFeed = useMemo(() => {
    const ideaBoard = tripData?.ideaBoard || [];
    return ideaBoard.filter((idea) => {
      const votes = idea.votes || {};
      const hasVoted = votes[CURRENT_USER_ID] !== undefined;
      return !hasVoted && idea.status !== "approved";
    });
  }, [tripData, CURRENT_USER_ID]);

  const inProgressFeed = useMemo(() => {
    const ideaBoard = tripData?.ideaBoard || [];
    return ideaBoard.filter((idea) => {
      const votes = idea.votes || {};
      return votes[CURRENT_USER_ID] === "yes" && idea.status !== "approved" && idea.status !== "scheduled";
    });
  }, [tripData, CURRENT_USER_ID]);

  const unassignedIdeas = useMemo(() => {
    const ideaBoard = tripData?.ideaBoard || [];
    return ideaBoard.filter((idea) => idea.status === "approved");
  }, [tripData]);

  const handleVote = (ideaId, voteType) => {
    setTripData((prev) => {
      const activeGroupSize = prev.group.filter((member) => member.active).length;
      const requiredVotes = Math.floor(activeGroupSize / 2) + 1;

      const updatedIdeas = prev.ideaBoard.map((idea) => {
        if (idea.id === ideaId) {
          const currentVotes = idea.votes || {};
          const newVotes = { ...currentVotes, [CURRENT_USER_ID]: voteType };
          const yesCount = Object.values(newVotes).filter((v) => v === "yes").length;
          const isNowApproved = yesCount >= requiredVotes;

          return {
            ...idea,
            votes: newVotes,
            status: isNowApproved ? "approved" : idea.status || "voting",
          };
        }
        return idea;
      });

      return { ...prev, ideaBoard: updatedIdeas };
    });
  };

  const addEventToBucket = (date, event) => {
    setTripData((prev) => {
      const updatedIdeaBoard = prev.ideaBoard.map((idea) =>
        idea.id === event.id ? { ...idea, status: "scheduled" } : idea
      );

      const newEvent = { ...event, id: Date.now().toString(), type: "event", time: "TBD" };

      return {
        ...prev,
        ideaBoard: updatedIdeaBoard,
        timelineData: {
          ...prev.timelineData,
          [date]: [...(prev.timelineData[date] || []), newEvent],
        },
      };
    });
  };

  const updateDayEvents = (date, newlyOrderedData) => {
    setTripData((prev) => ({
      ...prev,
      timelineData: { ...prev.timelineData, [date]: newlyOrderedData },
    }));
  };

  const deleteStay = (stayId) => {
    setTripData((prev) => ({
      ...prev,
      staysData: prev.staysData.filter((stay) => stay.id !== stayId),
    }));
  };

  const addTransaction = (payload) => {
    setTripData((prev) => {
      const newTransaction = {
        id: Date.now().toString(),
        title: payload.title,
        icon: payload.icon || "receipt",
        payer: "You",
        split: payload.isSplitEqually ? "Split equally" : "Custom split",
        amount: payload.amount,
      };

      const newBudgetData = {
        ...prev.budgetData,
        totalSpent: prev.budgetData.totalSpent + payload.amount,
      };

      const newGroupBalances = prev.groupBalances.map((member) => {
        const memberSplit = payload.splits.find((s) => String(s.memberId) === String(member.id));

        if (memberSplit) {
          const amountOwed = payload.isSplitEqually
            ? payload.amount / payload.splits.length
            : memberSplit.amount;

          return {
            ...member,
            balance: member.balance + amountOwed,
          };
        }
        return member;
      });

      return {
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        budgetData: newBudgetData,
        groupBalances: newGroupBalances,
      };
    });
  };

  const addSettlement = (payload) => {
    setTripData((prev) => {
      const newGroupBalances = prev.groupBalances.map((member) => {
        if (String(member.id) === String(payload.toMemberId)) {
          const newBalance = member.balance > 0 ? member.balance - payload.amount : member.balance + payload.amount;
          return { ...member, balance: newBalance };
        }
        return member;
      });

      const targetMember = prev.groupBalances.find((m) => String(m.id) === String(payload.toMemberId));
      const newTransaction = {
        id: Date.now().toString(),
        title: `Paid ${targetMember?.name || "Member"}`,
        icon: "check-circle-outline",
        payer: "You",
        split: "Settlement",
        amount: payload.amount,
      };

      return {
        ...prev,
        groupBalances: newGroupBalances,
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  };

  if (isLoading || !tripData) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const contextValue = {
    ...tripData,
    discoverFeed,
    inProgressFeed,
    unassignedIdeas,
    refreshTripData,
    handleVote,
    addEventToBucket,
    updateDayEvents,
    deleteStay,
    addTransaction,
    addSettlement,
  };

  return (
    <TripContext.Provider value={contextValue}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <CustomHeader trip={tripData} />
        <Tabs
          screenOptions={{
            tabBarStyle: { display: "none" },
            headerShown: false,
            unmountOnBlur: true,
          }}
        >
          <Tabs.Screen name="overview" options={{ title: "Overview" }} />
          <Tabs.Screen name="(plan)" options={{ title: "Plan" }} />
          <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
          <Tabs.Screen name="docs" options={{ title: "Docs" }} />
          <Tabs.Screen name="chat" options={{ title: "Chat" }} />
          <Tabs.Screen name="memories" options={{ title: "Memories" }} />
          <Tabs.Screen name="album" options={{ headerShown: false }} />
          <Tabs.Screen name="settings" options={{ headerShown: false }} />
        </Tabs>
      </View>
    </TripContext.Provider>
  );
}

const styles = StyleSheet.create({
  headerContainer: { height: "39%" },
  imageBackground: { flex: 1 },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "5%",
    paddingTop: moderateScale(65),
  },
  headerButtonRow: { flexDirection: "row", alignItems: "center", gap: moderateScale(12) },
  contentWrapper: { flex: 1, paddingHorizontal: "5%", paddingTop: moderateScale(40), paddingBottom: moderateScale(28) },
  spacer: { flex: 1 },
  textContainer: { gap: 4 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: moderateScale(6) },
  destination: { color: "white", fontSize: moderateScale(25), fontWeight: "bold" },
  dateRange: { color: "white", fontSize: moderateScale(12), marginTop: 4 },
  loadingState: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
});
