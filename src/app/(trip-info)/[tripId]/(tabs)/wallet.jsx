import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import ProgressBar from "@/src/components/progressBar";
import TripInfoScrollView from "@/src/components/tripInfoScrollView";
import { Colors } from '@/src/constants/colors';
import { supabase } from '@/src/lib/supabase';
import DateUtils from "@/src/utils/DateUtils";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';


// ==========================================
// 1. CONSTANTS & HELPER COMPONENTS
// ==========================================

const CATEGORIES = [
  { id: 1, name: 'Food', icon: 'food-fork-drink' },
  { id: 2, name: 'Transport', icon: 'car' },
  { id: 3, name: 'Lodging', icon: 'bed' },
  { id: 4, name: 'Activity', icon: 'ticket' },
  { id: 5, name: 'Other', icon: 'receipt' },
];

const BalanceCard = ({ member, onRemind, onPay }) => {
  const isOwed = member.balance > 0; 
  const names = member.name.trim().split(/\s+/);
  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);
  
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberInfo}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center'}]}>
            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '700'}}>
              {(firstInitial + lastInitial).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={[styles.balanceStatus, { color: isOwed ? Colors.success : Colors.danger }]}>
            {isOwed ? 'Owes you' : 'You owe'} ${Math.abs(member.balance).toFixed(2)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.actionBtn, isOwed ? styles.btnOutline : styles.btnFilled]}
        onPress={() => isOwed ? onRemind(member) : onPay(member)}
      >
        <Text style={[styles.btnText, isOwed ? { color: Colors.darkBlue } : { color: 'white' }]}>
          {isOwed ? 'Remind' : 'Pay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const MemberSelecter = ({ member, isSplitEqually, splitData, onUpdateSplit }) => {
  const isSelected = splitData?.selected || false;
  const exactAmount = splitData?.amount || '';

  return (
    <TouchableOpacity 
      style={[styles.memberSelectorCard, isSelected && styles.memberSelectorCardActive]} 
      onPress={() => onUpdateSplit(member.id, { selected: !isSelected, amount: exactAmount })}
    >
      <View style={styles.memberSelectorInfo}>
        <Image source={{ uri: member.avatar }} style={styles.selectorAvatar} />
        <Text style={[styles.selectorName, isSelected && { color: Colors.darkBlue }]}>
          {member.name}
        </Text>
      </View>

      { isSplitEqually ? (
        <Checkbox
          value={isSelected}
          onValueChange={() => onUpdateSplit(member.id, { selected: !isSelected, amount: exactAmount })}
          color={isSelected ? Colors.primary : undefined}
          style={styles.selectorCheckbox}
        />
      ) : (
        isSelected && (
          <View style={styles.exactAmountWrapper}>
            <Text style={styles.exactAmountSymbol}>$</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondaryDark}
              keyboardType="numeric"
              value={exactAmount}
              onChangeText={(text) => onUpdateSplit(member.id, { selected: true, amount: text })}
              style={styles.exactAmountInput}
              autoFocus
            />
          </View>
        )
      )}
    </TouchableOpacity>
  );
};

// ==========================================
// 2. MAIN SCREEN
// ==========================================

export default function WalletScreen() {
  const tripData = useTrip(); 
  const { tripId, addTransaction, addSettlement } = tripData;

  // TODO: Replace this hardcoded ID with your actual User Auth Context!
  const [userId, setUserId] = useState('5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'); 

  const defaultFormState = {
    id: null,
    title: '',
    amount: '',
    categoryId: null,
    isSplitEqually: true,
    splits: {} 
  };
  
  const [walletState, setWalletState] = useState({
    otherMembers: [],
    transactions: [],
    budgetData: { totalSpent: 0, totalBudget: 0 },
    myBalance: 0,
  });
  
  const [isFetchingWallet, setIsFetchingWallet] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [expenseForm, setExpenseForm] = useState(defaultFormState);
  const [expandedTxId, setExpandedTxId] = useState(null);
  
  const fetchWalletData = async () => {
    if (!tripId ) return; 
    setIsFetchingWallet(true);
    
    try {
      // 1. Manually grab the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No active session found!");
        return;
      }

      // 2. Force the token into the headers of the invoke call
      const { data, error } = await supabase.functions.invoke('get-trip-wallet', {
        body: { tripId },
      });

      if (error) {
        console.error("Wallet Error:", error);
        return;
      }     

      setWalletState({
        otherMembers: data.otherMembers || [],
        transactions: data.transactions || [],
        budgetData: data.budgetData || { totalSpent: 0, totalBudget: 0 },
        myBalance: data.myBalance || 0
      });
    } catch (error) {
      console.error("Error fetching wallet from Edge Function:", error);
      Alert.alert("Sync Error", "Could not fetch latest balances. Please pull down to refresh.");
    } finally {
      setIsFetchingWallet(false);
    }
  };

  // --- ACTIONS ---
  
  const handleOpenAdd = () => {
    setExpenseForm(defaultFormState);
    setModalVisible(true);
  };

  const handleDeleteExpense = (transactionId) => {
    Alert.alert("Delete Expense", "Are you sure? This will recalculate everyone's balances.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            // 1. Delete the child splits first (safest method)
            const { error: splitError } = await supabase
              .from('Expense_Splits')
              .delete()
              .eq('expense_id', transactionId);
              
            if (splitError) throw splitError;

            // 2. Delete the parent expense
            const { error: expenseError } = await supabase
              .from('Expenses')
              .delete()
              .eq('expense_id', transactionId); // Adjust 'expense_id' if your primary key is named differently

            if (expenseError) throw expenseError;

            // 3. Refresh the UI
            fetchWalletData(); 
          } catch (err) {
            console.error("Error deleting expense:", err);
            Alert.alert("Error", "Could not delete the expense.");
          }
        }
      }
    ]);
  };

  const handleTransactionLongPress = (transaction) => {
    Alert.alert("Manage Expense", transaction.title, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteExpense(transaction.id) }
    ]);
  };

  const handleSaveExpense = async () => {
    try {
      const selectedCategory = CATEGORIES.find(c => c.id === expenseForm.categoryId);
      const totalAmount = parseFloat((expenseForm.amount));
      
      let finalExpenseId = expenseForm.id;

      if (finalExpenseId) {
        // 1a. UPDATE EXISTING EXPENSE
        const { error: updateError } = await supabase
          .from('Expenses')
          .update({
            total_amount: totalAmount.toFixed(2),
            category: selectedCategory ? selectedCategory.name : 'Other',
            description: expenseForm.title,
          })
          .eq('expense_id', finalExpenseId);
          
        if (updateError) throw updateError;

        // Easiest way to update splits: delete the old ones before we insert the new ones
        await supabase.from('Expense_Splits').delete().eq('expense_id', finalExpenseId);

      } else {
        // 1b. INSERT NEW EXPENSE
        const { data: newExpense, error: insertError } = await supabase
          .from('Expenses')
          .insert({
            trip_id: tripId,
            paid_by: userId,
            total_amount: totalAmount.toFixed(2),
            category: selectedCategory ? selectedCategory.name : 'Other',
            description: expenseForm.title,
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        finalExpenseId = newExpense.expense_id; // Capture new ID for the splits
      }

      // 2. Calculate the math and prep the splits
      const selectedMembers = Object.entries(expenseForm.splits).filter(([_, data]) => data.selected);
      const equalSplitAmount = totalAmount / selectedMembers.length;

      const splitsToInsert = selectedMembers.map(([memberId, data]) => ({
        expense_id: finalExpenseId, 
        user_id: memberId,
        amount_owed: expenseForm.isSplitEqually ? equalSplitAmount : parseFloat(data.amount)
      }));

      // 3. Insert the new splits into the database
      const { error: splitsError } = await supabase
        .from('Expense_Splits')
        .insert(splitsToInsert);
        
      if (splitsError) throw splitsError;

      // 4. Clean up the UI and refresh the wallet!
      setModalVisible(false);
      setExpenseForm(defaultFormState);
      fetchWalletData();

    } catch (err) {
      console.error("Error saving expense:", err);
      Alert.alert("Error", "Could not save the expense. Please try again.");
    }
  };
  
  const handlePay = (member) => {
    Alert.alert(
      "Record Payment",
      `Did you pay $${Math.abs(member.balance).toFixed(2)} to ${member.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, I paid", 
          onPress: async () => {
            try {
              setIsFetchingWallet(true);
              
              const { data: expense, error: expError } = await supabase
                .from('Expenses')
                .insert({
                  trip_id: tripId,
                  paid_by: userId, 
                  total_amount: parseFloat(Math.abs(member.balance).toFixed(2)),
                  category: 'Settlement',
                  description: `Paid back ${member.name}`
                })
                .select()
                .single();

              if (expError) throw expError;

              const { error: splitError } = await supabase
                .from('Expense_Splits')
                .insert({
                  expense_id: expense.expense_id,
                  user_id: member.id,
                  amount_owed: Math.abs(member.balance)
                });

              if (splitError) throw splitError;

              Alert.alert("Recorded!", "Your balance has been updated.");
              fetchWalletData();
            } catch (err) {
              console.error("Settlement Error:", err);
              Alert.alert("Error", "Could not process payment.");
              setIsFetchingWallet(false);
            }
          } 
        }
      ]
    );
  };

  const handleRemind = (member) => {
    console.log("Trigger backend notification route for user:", member.id);
    Alert.alert("Reminder Sent", `We sent a push notification to ${member.name} to pay you back!`);
  };

  const handleUpdateSplit = (memberId, data) => {
    setExpenseForm(prev => ({
      ...prev,
      splits: { ...prev.splits, [memberId]: data }
    }));
  };

  const isFormValid = () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.categoryId) return false;
    
    const selectedMembers = Object.values(expenseForm.splits).filter(s => s.selected);
    if (selectedMembers.length === 0) return false;

    if (!expenseForm.isSplitEqually) {
      const totalAmount = parseFloat(expenseForm.amount) || 0;
      const sumOfSplits = selectedMembers.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      if (Math.abs(totalAmount - sumOfSplits) > 0.01) return false; 
    }

    return true;
  };


  // --- DERIVED DATA ---
  const { otherMembers, transactions, budgetData, myBalance } = walletState;
  
  const percentSpent = budgetData.totalBudget > 0 
    ? Math.floor((budgetData.totalSpent / budgetData.totalBudget) * 100) 
    : 0;
  
  const isNetPositive = myBalance >= 0;
  const formattedNetBalance = `${isNetPositive ? '+' : '-'}$${Math.abs(myBalance).toFixed(2)}`;
  

  useEffect(() => {
    fetchWalletData();
  }, [tripId, userId]);

  useEffect(() => {
    if (isModalVisible && !expenseForm.id && Object.keys(expenseForm.splits).length === 0) {
      const initialSplits = {};
      walletState.otherMembers.forEach(m => {
        initialSplits[m.id] = { selected: true, amount: '' };
      });
      setExpenseForm(prev => ({ ...prev, splits: initialSplits }));
    }
  }, [isModalVisible]);

  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const grouped = transactions.reduce((acc, transaction) => {
      // Convert the database timestamp into a readable date string (e.g., "Mar 24, 2026")
      // Note: Make sure 'transaction.date' matches whatever your date field is actually called!
      // console.log(transaction.date)
      const dateObj = DateUtils.timestampToDate(transaction.date); 
      const dateString = dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(transaction);
      return acc;
    }, {});

    // Convert that object into an array of sections sorted from newest to oldest
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a)) // Sort headers descending
      .map(date => ({
        title: date,
        data: grouped[date]
      }));
  }, [transactions]);


  // Performance optimization: Filter this array once per render
  const activeMembers = otherMembers.filter(m => Math.abs(m.balance) > 0.01);

  if (isFetchingWallet && transactions.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Calculating Balances...</Text>
      </View>
    );
  }


  return (
    <TripInfoScrollView onRefresh={fetchWalletData} style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* BUDGET CARD */}
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
            <Text style={styles.remainingAmount}>${Math.max(0, budgetData.totalBudget - budgetData.totalSpent).toFixed(2)}</Text>
          </View>
        </View>

        <ProgressBar width="100%" height={moderateScale(8)} progress={`${isNaN(percentSpent) ? 0 : percentSpent}%`} backgroundColor="rgba(255,255,255,0.3)" />

        <View style={styles.budgetFooter}>
          <View style={styles.footerItem}>
            <MaterialIcons name="calendar-today" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}> ~$160/day avg</Text>
          </View>
          <Text style={styles.totalBudget}>of ${budgetData.totalBudget.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addExpenseButton} onPress={handleOpenAdd}>
        <Text style={styles.addExpenseButtonText}>Add Expense</Text>
      </TouchableOpacity>

      {/* GROUP BALANCES */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Group Balances</Text>
        </View>

        <View style={styles.card}>
            <View style={styles.netStandingRow}>
                <View style={styles.netInfo}>
                    <Text style={styles.netLabel}>Your Net Standing</Text>
                    <Text style={[styles.netAmount, { color: isNetPositive ? Colors.success : Colors.danger }]}>
                      {formattedNetBalance}
                    </Text>
                </View>
                <View style={styles.netChartIcon}>
                   <MaterialCommunityIcons 
                     name="scale-balance" 
                     size={24} 
                     color={isNetPositive ? Colors.success : Colors.danger} 
                   />
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.membersList}>
                {activeMembers.length === 0 ? (
                    <View style={styles.settledContainer}>
                        <MaterialCommunityIcons name="party-popper" size={32} color={Colors.success} style={{ marginBottom: 10 }} />
                        <Text style={styles.settledTitle}>All Settled Up!</Text>
                        <Text style={styles.settledSubtitle}>You don't owe anyone, and nobody owes you.</Text>
                    </View>
                ) : (
                    activeMembers.map((member) => (
                      <BalanceCard key={member.id} member={member} onRemind={handleRemind} onPay={handlePay} />
                    ))
                )}
            </View>
        </View>
      </View>

      {/* RECENT ACTIVITY */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((section) => (
            <View key={section.title} style={{ marginBottom: 20 }}>
              
              {/* The Date Header */}
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: '#666', 
                marginLeft: 4, 
                marginBottom: 8,
                textTransform: 'uppercase'
              }}>
                {section.title}
              </Text>

              {/* The Transaction Cards for that specific date */}
              {section.data.map((transaction) => (
                <View key={transaction.id}>
                  <TouchableOpacity 
                    style={styles.transactionRow} 
                    onPress={() => setExpandedTxId(expandedTxId === transaction.id ? null : transaction.id)}
                    onLongPress={() => handleTransactionLongPress(transaction)}
                    delayLongPress={200}
                  >
                    <View style={styles.transLeft}>
                      <View style={styles.iconBox}>
                        <MaterialCommunityIcons 
                          name={CATEGORIES.find(c => c.name.toLowerCase() === (transaction.icon || '').toLowerCase())?.icon || 'receipt'} 
                          size={20} 
                          color={Colors.primary} 
                        />
                      </View>
                      
                      <View style={styles.transTextContainer}>
                        <Text 
                          style={styles.transTitle} 
                          numberOfLines={expandedTxId === transaction.id ? undefined : 1} 
                          ellipsizeMode="tail"
                        >
                          {transaction.title}
                        </Text>
                        <Text style={styles.transMeta}>Paid by <Text style={{fontWeight: '700'}}>{transaction.payer}</Text> • {transaction.split}</Text>
                      </View>
                    </View>
                    <Text style={styles.transAmount}>${transaction.amount.toFixed(2)}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
            No recent activity.
          </Text>
        )}
        
      </View>
      
      {/* BOTTOM SHEET */}
      <AnimatedBottomSheet visible={isModalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{expenseForm.id ? 'Edit Shared Expense' : 'Add Shared Expense'}</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <MaterialIcons name="close" size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          
          <Text style={styles.modalLabel}>AMOUNT</Text>
          <View style={styles.modalAmountContainer}>
            <Text style={styles.modalCurrencySymbol}>$</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondaryDark}
              keyboardType="numeric"
              style={styles.modalAmountInput}
              value={expenseForm.amount}
              onChangeText={(text) => setExpenseForm({...expenseForm, amount: text})}
            />
          </View>
          
          <Text style={styles.modalLabel}>WHAT WAS IT FOR?</Text>
          <TextInput
            placeholder="e.g., Dinner at Sushi Place"
            style={styles.modalTextInput}
            value={expenseForm.title}
            onChangeText={(text) => setExpenseForm({...expenseForm, title: text})}
          />
          
          <Text style={styles.modalLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalCategoryContainer}>
            {CATEGORIES.map((category) => {
              const isSelected = expenseForm.categoryId === category.id;
              return (
                <TouchableOpacity 
                  key={category.id} 
                  style={[styles.modalCategoryButton, isSelected && styles.modalCategoryButtonActive]} 
                  onPress={() => setExpenseForm({...expenseForm, categoryId: category.id})}
                >
                  <MaterialCommunityIcons 
                    name={category.icon} 
                    size={18} 
                    color={isSelected ? 'white' : Colors.textSecondary} 
                  />
                  <Text style={[styles.modalCategoryButtonText, isSelected && { color: 'white' }]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          
          <View style={styles.modalSplitHeader}>
            <Text style={styles.modalLabel}>SPLIT WITH</Text>
            <TouchableOpacity 
              style={styles.modalSplitEquallyContainer}
              onPress={() => setExpenseForm({...expenseForm, isSplitEqually: !expenseForm.isSplitEqually})}
            >
              <Text style={styles.modalSplitEquallyText}>Split Equally</Text>
              <Checkbox 
                value={expenseForm.isSplitEqually} 
                onValueChange={() => setExpenseForm({...expenseForm, isSplitEqually: !expenseForm.isSplitEqually})} 
                color={expenseForm.isSplitEqually ? Colors.primary : undefined}
                style={styles.modalCheckbox}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalMemberList}>
            {otherMembers.map((member) => (
              <MemberSelecter 
                key={member.id} 
                member={member} 
                isSplitEqually={expenseForm.isSplitEqually} 
                splitData={expenseForm.splits[member.id]}
                onUpdateSplit={handleUpdateSplit}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.premiumSubmitButton, !isFormValid() && styles.premiumSubmitDisabled]} 
            disabled={!isFormValid()}
            onPress={handleSaveExpense}
          >
            <Text style={styles.premiumSubmitText}>{expenseForm.id ? 'Update Expense' : 'Save Expense'}</Text>
          </TouchableOpacity>
        
        </ScrollView>
      </AnimatedBottomSheet>
    </TripInfoScrollView>
  );
}

// ==========================================
// 3. STYLES 
// ==========================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: Colors.textSecondary },
  
  budgetCard: { backgroundColor: Colors.darkBlue, borderRadius: 24, padding: moderateScale(24), marginBottom: moderateScale(24), shadowColor: Colors.darkBlue, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(16) },
  budgetLabel: { color: '#94A3B8', fontSize: moderateScale(14), fontWeight: '600', textTransform: 'uppercase', letterSpacing: moderateScale(0.5) },
  budgetBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(4), borderRadius: 12 },
  budgetBadgeText: { color: Colors.primary, fontSize: moderateScale(12), fontWeight: '700' },
  mainFigures: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: moderateScale(20) },
  spentAmount: { fontSize: moderateScale(36), fontWeight: '800', color: 'white', letterSpacing: -1 },
  verticalDivider: { width: 1, height: moderateScale(30), backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: moderateScale(16), marginBottom: moderateScale(6) },
  remainingLabel: { color: '#94A3B8', fontSize: moderateScale(12), marginBottom: moderateScale(4) },
  remainingAmount: { color: Colors.success, fontSize: moderateScale(18), fontWeight: '700' },
  budgetFooter: { marginTop: moderateScale(12), flexDirection: 'row', justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#94A3B8', fontSize: moderateScale(12) },
  totalBudget: { color: '#94A3B8', fontSize: moderateScale(12) },

  addExpenseButton: { width: '80%', alignSelf: 'center', marginBottom: moderateScale(24), backgroundColor: Colors.primary, paddingVertical: moderateScale(14), borderRadius: moderateScale(12), alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, elevation: 3 },
  addExpenseButtonText: { color: 'white', fontSize: moderateScale(16), fontWeight: '700' },

  sectionContainer: { marginBottom: moderateScale(24) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(12), paddingHorizontal: moderateScale(4) },
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '700', color: Colors.darkBlue },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic', paddingHorizontal: 4 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: moderateScale(20), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  
  netStandingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(16) },
  netLabel: { color: Colors.textSecondary, fontSize: moderateScale(11), fontWeight: '600', marginBottom: moderateScale(4) },
  netAmount: { fontSize: moderateScale(23), fontWeight: '800' },
  netChartIcon: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: Colors.lightGray, marginBottom: moderateScale(16) },
  
  membersList: { gap: 16 },
  settledContainer: { alignItems: 'center', paddingVertical: 15 },
  settledTitle: { fontSize: 16, fontWeight: '700', color: Colors.darkBlue },
  settledSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
  avatar: { width: moderateScale(42), height: moderateScale(42), borderRadius: moderateScale(21), borderWidth: moderateScale(2), borderColor: Colors.lightGray },
  memberName: { fontSize: moderateScale(15), fontWeight: '700', color: Colors.darkBlue },
  balanceStatus: { fontSize: moderateScale(12), fontWeight: '600' },
  
  actionBtn: { paddingVertical: moderateScale(6), paddingHorizontal: moderateScale(16), borderRadius: 10, minWidth: moderateScale(80), alignItems: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.lightGray },
  btnFilled: { backgroundColor: Colors.darkBlue },
  btnText: { fontSize: 12, fontWeight: '600' },

  transactionRow: { backgroundColor: 'white', borderRadius: 16, padding: moderateScale(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(10), shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  transLeft: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), flex: 1, paddingRight: 15 },
  iconBox: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12), backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  transTextContainer: { flex: 1 },
  transTitle: { fontSize: moderateScale(14), fontWeight: '700', color: Colors.darkBlue, marginBottom: moderateScale(2) },
  transMeta: { fontSize: moderateScale(11), color: Colors.textSecondary },
  transAmount: { fontSize: moderateScale(15), fontWeight: '700', color: Colors.darkBlue },

  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  closeButton: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 },
  
  modalLabel: { fontSize: 12, letterSpacing: 1, marginBottom: 10, color: '#64748b', fontWeight: '700' },
  modalAmountContainer: { flexDirection: 'row', width: '100%', borderBottomWidth: 2, borderBottomColor: Colors.primary, marginBottom: 24, gap: 10, paddingBottom: 10, alignItems: 'center' },
  modalCurrencySymbol: { fontSize: 32, fontWeight: '800', color: Colors.darkBlue },
  modalAmountInput: { fontSize: 32, fontWeight: '800', color: Colors.darkBlue, flex: 1 },
  modalTextInput: { width: '100%', backgroundColor: '#f8fafc', padding: 16, fontSize: 16, borderRadius: 12, marginBottom: 24, fontWeight: '500', color: Colors.darkBlue, borderWidth: 1, borderColor: '#f1f5f9' },
  
  modalCategoryContainer: { flexDirection: 'row', gap: 10, marginBottom: 30, paddingBottom: 5 },
  modalCategoryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', marginRight: 8 },
  modalCategoryButtonActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  modalCategoryButtonText: { fontWeight: '600', color: '#475569', fontSize: 14 },
  
  modalSplitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalSplitEquallyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 5 },
  modalSplitEquallyText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  modalCheckbox: { borderWidth: 1, borderRadius: 4 },
  modalMemberList: { gap: 10, marginBottom: 20 },
  
  memberSelectorCard: { backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9' },
  memberSelectorCardActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  memberSelectorInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectorAvatar: { width: 36, height: 36, borderRadius: 18 },
  selectorName: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  selectorCheckbox: { borderWidth: 1, borderRadius: 10 },
  
  exactAmountWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 8 },
  exactAmountSymbol: { color: Colors.textSecondaryDark, fontWeight: '600', marginRight: 2 },
  exactAmountInput: { width: 60, paddingVertical: 6, fontSize: 14, fontWeight: '600', color: Colors.darkBlue, textAlign: 'center' },

  premiumSubmitButton: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  premiumSubmitDisabled: { backgroundColor: '#cbd5e1' },
  premiumSubmitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});