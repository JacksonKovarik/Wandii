import { WALLET_CATEGORIES } from "@/src/constants/TripConstants";
import { supabase } from '@/src/lib/supabase';
import DateUtils from "@/src/utils/DateUtils";
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export function useWalletData(tripId, userId, currencySymbol) {
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
    if (!tripId) return; 
    setIsFetchingWallet(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("No active session found!");

      const { data, error } = await supabase.functions.invoke('get-trip-wallet', {
        body: { tripId },
      });

      if (error) throw error;     

      setWalletState({
        otherMembers: data.otherMembers || [],
        transactions: data.transactions || [],
        budgetData: data.budgetData || { totalSpent: 0, totalBudget: 0 },
        myBalance: data.myBalance || 0
      });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      Alert.alert("Sync Error", "Could not fetch latest balances.");
    } finally {
      setIsFetchingWallet(false);
    }
  };

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
            const { error: splitError } = await supabase.from('Expense_Splits').delete().eq('expense_id', transactionId);
            if (splitError) throw splitError;

            const { error: expenseError } = await supabase.from('Expenses').delete().eq('expense_id', transactionId); 
            if (expenseError) throw expenseError;

            fetchWalletData(); 
          } catch (err) {
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
      const selectedCategory = WALLET_CATEGORIES.find(c => c.id === expenseForm.categoryId);
      const totalAmount = parseFloat((expenseForm.amount));
      let finalExpenseId = expenseForm.id;

      if (finalExpenseId) {
        const { error: updateError } = await supabase
          .from('Expenses')
          .update({
            total_amount: totalAmount.toFixed(2),
            category: selectedCategory ? selectedCategory.name : 'Other',
            description: expenseForm.title,
          })
          .eq('expense_id', finalExpenseId);
        if (updateError) throw updateError;
        await supabase.from('Expense_Splits').delete().eq('expense_id', finalExpenseId);
      } else {
        const { data: newExpense, error: insertError } = await supabase
          .from('Expenses')
          .insert({
            trip_id: tripId,
            paid_by: userId,
            total_amount: totalAmount.toFixed(2),
            category: selectedCategory ? selectedCategory.name : 'Other',
            description: expenseForm.title,
          })
          .select().single();
        if (insertError) throw insertError;
        finalExpenseId = newExpense.expense_id; 
      }

      const selectedMembers = Object.entries(expenseForm.splits).filter(([_, data]) => data.selected);
      const equalSplitAmount = totalAmount / selectedMembers.length;

      const splitsToInsert = selectedMembers.map(([memberId, data]) => ({
        expense_id: finalExpenseId, 
        user_id: memberId,
        amount_owed: expenseForm.isSplitEqually ? equalSplitAmount : parseFloat(data.amount)
      }));

      const { error: splitsError } = await supabase.from('Expense_Splits').insert(splitsToInsert);
      if (splitsError) throw splitsError;

      setModalVisible(false);
      setExpenseForm(defaultFormState);
      fetchWalletData();
    } catch (err) {
      Alert.alert("Error", "Could not save the expense.");
    }
  };
  
  const handlePay = (member) => {
    Alert.alert(
      "Record Payment",
      `Did you pay ${currencySymbol}${Math.abs(member.balance).toFixed(2)} to ${member.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, I paid", 
          onPress: async () => {
            try {
              setIsFetchingWallet(true);
              const { data: expense, error: expError } = await supabase.from('Expenses')
                .insert({
                  trip_id: tripId, paid_by: userId, total_amount: parseFloat(Math.abs(member.balance).toFixed(2)),
                  category: 'Settlement', description: `Paid back ${member.name}`
                }).select().single();
              if (expError) throw expError;

              const { error: splitError } = await supabase.from('Expense_Splits')
                .insert({ expense_id: expense.expense_id, user_id: member.id, amount_owed: Math.abs(member.balance) });
              if (splitError) throw splitError;

              Alert.alert("Recorded!", "Your balance has been updated.");
              fetchWalletData();
            } catch (err) {
              Alert.alert("Error", "Could not process payment.");
              setIsFetchingWallet(false);
            }
          } 
        }
      ]
    );
  };

  const handleRemind = (member) => {
    Alert.alert("Reminder Sent", `We sent a push notification to ${member.name} to pay you back!`);
  };

  const handleUpdateSplit = (memberId, data) => {
    setExpenseForm(prev => ({ ...prev, splits: { ...prev.splits, [memberId]: data } }));
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
  const groupedTransactions = useMemo(() => {
    if (!walletState.transactions || walletState.transactions.length === 0) return [];
    const grouped = walletState.transactions.reduce((acc, transaction) => {
      const dateObj = DateUtils.timestampToDate(transaction.date); 
      const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!acc[dateString]) acc[dateString] = [];
      acc[dateString].push(transaction);
      return acc;
    }, {});
    return Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).map(date => ({ title: date, data: grouped[date] }));
  }, [walletState.transactions]);

  const activeMembers = walletState.otherMembers.filter(m => Math.abs(m.balance) > 0.01);
  const percentSpent = walletState.budgetData.totalBudget > 0 ? Math.floor((walletState.budgetData.totalSpent / walletState.budgetData.totalBudget) * 100) : 0;
  const isNetPositive = walletState.myBalance >= 0;
  const formattedNetBalance = `${isNetPositive ? '+' : '-'}${currencySymbol}${Math.abs(walletState.myBalance).toFixed(2)}`;

  return {
    walletState,
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
  };
}