import ProgressBar from "@/src/components/progressBar";
import { Colors } from '@/src/constants/colors';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

// --- Mock Data & API ---
// In a real app, this data would come from your backend API.
const MOCK_TRIP_DATA = {
  'default-trip': {
    groupBalances: [
      { id: 1, name: 'Hunter', balance: 45.00, avatar: 'https://i.pravatar.cc/150?u=hunter' },
      { id: 2, name: 'Ashley', balance: 75.00, avatar: 'https://i.pravatar.cc/150?u=ashley' },
      { id: 3, name: 'Sarah', balance: -24.50, avatar: 'https://i.pravatar.cc/150?u=sarah' },
    ],
    transactions: [
      { id: 1, title: 'Sushi Dinner', payer: 'You', split: 'Split equally', amount: 128.50, icon: 'food-fork-drink' },
      { id: 2, title: 'Uber to Hotel', payer: 'Hunter', split: 'Split equally', amount: 24.50, icon: 'car' },
    ],
    budgetData: { totalSpent: 1240.50, totalBudget: 3200.00 },
  },
  // Add more trip data here keyed by tripId
};

// This function simulates fetching data for a specific trip.
const fetchTripData = async (tripId) => {
  console.log(`Fetching data for trip: ${tripId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_TRIP_DATA[tripId] || MOCK_TRIP_DATA['default-trip'];
};
// --- End Mock Data & API ---

export default function WalletScreenRedesign() {
  const { tripId } = useLocalSearchParams(); // 1. Get tripId from the route
  const [isLoading, setIsLoading] = useState(true);
  const [tripData, setTripData] = useState(null);

  // 2. Fetch data when the component mounts or tripId changes
  useEffect(() => {
    if (tripId) {
      setIsLoading(true);
      fetchTripData(tripId).then(data => {
        setTripData(data);
        setIsLoading(false);
      });
    }
  }, [tripId]);

  // 3. Show a loading indicator while fetching
  if (isLoading || !tripData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Destructure data for use in the component
  const { groupBalances, transactions, budgetData } = tripData;
  const percentSpent = Math.floor(budgetData.totalSpent / budgetData.totalBudget * 100);

  // Calculate net balance from the group balances
  const netBalance = groupBalances.reduce((acc, member) => acc + member.balance, 0);
  const isNetPositive = netBalance >= 0;
  const formattedNetBalance = `${isNetPositive ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}`;

  const BalanceCard = ({ member }) => {
    const isOwed = member.balance > 0;
    return (
      <View style={styles.memberRow}>
        <View style={styles.memberInfo}>
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={[styles.balanceStatus, { color: isOwed ? Colors.success : Colors.danger }]}>
              {isOwed ? 'Owes you' : 'You owe'} ${Math.abs(member.balance).toFixed(2)}
            </Text>
          </View>
        </View>
        
        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.actionBtn, isOwed ? styles.btnOutline : styles.btnFilled]}
          onPress={() => console.log(isOwed ? `Action: Remind ${member.name}` : `Action: Pay ${member.name}`)}
        >
          <Text style={[styles.btnText, isOwed ? { color: Colors.darkBlue } : { color: 'white' }]}>
            {isOwed ? 'Remind' : 'Pay'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 1. Main Budget Card */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetLabel}>Total Spent</Text>
          <View style={styles.budgetBadge}>
            <Text style={styles.budgetBadgeText}>{isNaN(percentSpent) ? 0 : percentSpent}% Used</Text>
          </View>
        </View>

        <View style={styles.mainFigures}>
          <Text style={styles.spentAmount}>${budgetData.totalSpent.toFixed(2)}</Text>
          <View style={styles.verticalDivider} />
          <View>
            <Text style={styles.remainingLabel}>Remaining</Text>
            <Text style={styles.remainingAmount}>${(budgetData.totalBudget - budgetData.totalSpent).toFixed(2)}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <ProgressBar width="100%" height={moderateScale(8)} progress={`${isNaN(percentSpent) ? 0 : percentSpent}%`} backgroundColor="rgba(255,255,255,0.3)" />

        <View style={styles.budgetFooter}>
          <View style={styles.footerItem}>
            <MaterialIcons name="calendar-today" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}> ~$160/day avg</Text>
          </View>
          <Text style={styles.totalBudget}>of ${budgetData.totalBudget.toFixed(2)}</Text>
        </View>
      </View>

      {/* 2. Redesigned Group Balances */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Group Balances</Text>
          {/* <TouchableOpacity>
            <Text style={styles.seeAllText}>Settle Up</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.card}>
            {/* Your Net Standing Header */}
            <View style={styles.netStandingRow}>
                <View style={styles.netInfo}>
                    <Text style={styles.netLabel}>Your Net Standing</Text>
                    <Text style={[styles.netAmount, { color: isNetPositive ? Colors.success : Colors.danger }]}>{formattedNetBalance}</Text>
                </View>
                <View style={styles.netChartIcon}>
                   {/* Abstract visual for "You are doing good" */}
                   <MaterialCommunityIcons name="scale-balance" size={24} color={Colors.success} />
                </View>
            </View>

            <View style={styles.divider} />

            {/* List of Debts */}
            <View style={styles.membersList}>
                {groupBalances.map((member) => (
                    <BalanceCard key={member.id} member={member} />
                ))}
            </View>
        </View>
      </View>

      {/* 3. Recent Activity (Quick Cleanup) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        {transactions.map((t) => (
          <View key={t.id} style={styles.transactionRow}>
            <View style={styles.transLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name={t.icon} size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.transTitle}>{t.title}</Text>
                <Text style={styles.transMeta}>Paid by <Text style={{fontWeight: '700'}}>{t.payer}</Text> • {t.split}</Text>
              </View>
            </View>
            <Text style={styles.transAmount}>${t.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  
  // --- Budget Card Styles ---
  budgetCard: {
    backgroundColor: Colors.darkBlue,
    borderRadius: 24,
    padding: moderateScale(24),
    marginBottom: moderateScale(24),
    shadowColor: Colors.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  budgetLabel: {
    color: '#94A3B8',
    fontSize: moderateScale(14),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: moderateScale(0.5),
  },
  budgetBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: 12,
  },
  budgetBadgeText: {
    color: Colors.primary,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  mainFigures: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: moderateScale(20),
  },
  spentAmount: {
    fontSize: moderateScale(36),
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
  },
  verticalDivider: {
    width: 1,
    height: moderateScale(30),
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(6),
  },
  remainingLabel: {
    color: '#94A3B8',
    fontSize: moderateScale(12),
    marginBottom: moderateScale(4),
  },
  remainingAmount: {
    color: Colors.success, // Highlight remaining in green
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  budgetFooter: {
    marginTop: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: moderateScale(12),
  },
  totalBudget: {
    color: '#94A3B8',
    fontSize: moderateScale(12),
  },

  // --- Group Section Styles ---
  sectionContainer: {
    marginBottom: moderateScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(12),
    paddingHorizontal: moderateScale(4),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: moderateScale(13),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  netStandingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  netLabel: {
    color: Colors.textSecondary,
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  netAmount: {
    color: Colors.success,
    fontSize: moderateScale(23),
    fontWeight: '800',
  },
  netChartIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#ECFDF5', // Light green bg
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.textSecondary,
    marginBottom: moderateScale(16),
  },
  membersList: {
    gap: 16,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  avatar: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    borderWidth: moderateScale(2),
    borderColor: Colors.textSecondaryLight,
  },
  memberName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
  balanceStatus: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  actionBtn: {
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(16),
    borderRadius: 10,
    minWidth: moderateScale(80),
    alignItems: 'center',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.textSecondaryLight,
  },
  btnFilled: {
    backgroundColor: Colors.darkBlue,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // --- Transaction Styles ---
  transactionRow: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(10),
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  transLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  iconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFF7ED', // Light orange
    alignItems: 'center',
    justifyContent: 'center',
  },
  transTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: moderateScale(2),
  },
  transMeta: {
    fontSize: moderateScale(11),
    color: Colors.textSecondary,
  },
  transAmount: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: Colors.darkBlue,
  },
});