import AnimatedBottomSheet from "@/src/components/AnimatedBottomSheet";
import ProgressBar from "@/src/components/progressBar";
import TripInfoScrollView from "@/src/components/trip-info/tripInfoScrollView";
import { BalanceCard } from "@/src/components/trip-info/wallet/balanceCard";
import { MemberSelecter } from "@/src/components/trip-info/wallet/memberSelector";
import { Colors } from '@/src/constants/colors';
import { WALLET_CATEGORIES } from "@/src/constants/TripConstants";
import { useAuth } from "@/src/context/AuthContext";
import { useWalletData } from "@/src/hooks/useWalletData";
import { useTrip } from "@/src/utils/TripContext";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const getCurrencySymbol = (code) => {
  const currencyMap = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "$", 
    AUD: "$", CHF: "CHF", CNY: "¥", INR: "₹", MXN: "$", 
    BRL: "R$", ZAR: "R"
  };
  return currencyMap[code] || "$";
};

export default function WalletScreen() {
  const tripData = useTrip(); 
  const { tripId, defaultCurrency } = tripData;
  const currencySymbol = getCurrencySymbol(defaultCurrency);
  
  const { user } = useAuth();

  // PULL IN EVERYTHING FROM THE HOOK
  const {
    walletState: { budgetData, transactions, otherMembers },
    isFetchingWallet,
    isModalVisible,
    setModalVisible,
    expenseForm,
    setExpenseForm,
    expandedTxId,
    setExpandedTxId,
    fetchWalletData,
    handleOpenAdd,
    handleTransactionLongPress,
    handleSaveExpense,
    handlePay,
    handleRemind,
    handleUpdateSplit,
    isFormValid,
    groupedTransactions,
    activeMembers,
    percentSpent,
    isNetPositive,
    formattedNetBalance
  } = useWalletData(tripId, user.id, currencySymbol);
  
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
          <Text style={styles.spentAmount}>{currencySymbol}{budgetData.totalSpent.toFixed(2)}</Text>
          <View style={styles.verticalDivider} />
          <View>
            <Text style={styles.remainingLabel}>Remaining</Text>
            <Text style={styles.remainingAmount}>{currencySymbol}{Math.max(0, budgetData.totalBudget - budgetData.totalSpent).toFixed(2)}</Text>
          </View>
        </View>

        <ProgressBar width="100%" height={moderateScale(8)} progress={`${isNaN(percentSpent) ? 0 : percentSpent}%`} backgroundColor="rgba(255,255,255,0.3)" />

        <View style={styles.budgetFooter}>
          <View style={styles.footerItem}>
            <MaterialIcons name="calendar-today" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}> ~{currencySymbol}160/day avg</Text>
          </View>
          <Text style={styles.totalBudget}>of {currencySymbol}{budgetData.totalBudget.toFixed(2)}</Text>
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
                    activeMembers.map((member) => {
                      if (member.id === user.id) return null;
                      return (
                        <BalanceCard 
                          key={member.id} 
                          member={member} 
                          onRemind={handleRemind} 
                          onPay={handlePay} 
                          currencySymbol={currencySymbol} 
                        />
                      )
                    })
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
              
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', marginLeft: 4, marginBottom: 8, textTransform: 'uppercase' }}>
                {section.title}
              </Text>

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
                          name={WALLET_CATEGORIES.find(c => c.name.toLowerCase() === (transaction.icon || '').toLowerCase())?.icon || 'receipt'} 
                          size={20} 
                          color={Colors.primary} 
                        />
                      </View>
                      
                      <View style={styles.transTextContainer}>
                        <Text style={styles.transTitle} numberOfLines={expandedTxId === transaction.id ? undefined : 1} ellipsizeMode="tail">
                          {transaction.title}
                        </Text>
                        <Text style={styles.transMeta}>Paid by <Text style={{fontWeight: '700'}}>{transaction.payer}</Text> • {transaction.split}</Text>
                      </View>
                    </View>
                    <Text style={styles.transAmount}>{currencySymbol}{transaction.amount.toFixed(2)}</Text>
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
            <Text style={styles.modalCurrencySymbol}>{currencySymbol}</Text>
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
            {WALLET_CATEGORIES.map((category) => {
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
            {activeMembers.map((member) => (
              <MemberSelecter 
                key={member.id} 
                member={member} 
                isSplitEqually={expenseForm.isSplitEqually} 
                splitData={expenseForm.splits[member.id]}
                onUpdateSplit={handleUpdateSplit}
                currencySymbol={currencySymbol} 
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
    
  exactAmountWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 8 },
  exactAmountSymbol: { color: Colors.textSecondaryDark, fontWeight: '600', marginRight: 2 },
  exactAmountInput: { width: 60, paddingVertical: 6, fontSize: 14, fontWeight: '600', color: Colors.darkBlue, textAlign: 'center' },

  premiumSubmitButton: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  premiumSubmitDisabled: { backgroundColor: '#cbd5e1' },
  premiumSubmitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});