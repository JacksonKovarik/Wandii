import { WALLET_CATEGORIES } from "@/src/constants/TripConstants";
import { supabase } from '@/src/lib/supabase';
import DateUtils from "@/src/utils/DateUtils";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

const defaultWalletState = {
    otherMembers: [],
    transactions: [],
    budgetData: { totalSpent: 0, totalBudget: 0 },
    myBalance: 0,
};

export const fetchWalletDataAPI = async (tripId, userId) => {
    if (!tripId || !userId) return null;
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error("No active session found!");

    const { data, error } = await supabase.functions.invoke('get-trip-wallet', {
        body: { tripId },
    });

    if (error) throw error;
    return data || defaultWalletState;
}

export function useWalletData(tripId, userId, currencySymbol) {
    const queryClient = useQueryClient();

    const defaultFormState = {
        id: null,
        title: '',
        amount: '',
        categoryId: null,
        isSplitEqually: true,
        splits: {} 
    };
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [expenseForm, setExpenseForm] = useState(defaultFormState);
    const [expandedTxId, setExpandedTxId] = useState(null);

    const {
        data: walletState = defaultWalletState,
        isLoading: isFetchingWallet,
        isFetching,
        refetch: fetchWalletData 
    } = useQuery({
        queryKey: ['wallet', tripId],
        queryFn: () => fetchWalletDataAPI(tripId, userId),
        enabled: !!tripId,
        staleTime: 1000 * 60 * 5, 
    });

    const groupedTransactions = useMemo(() => {
        if (!walletState.transactions || walletState.transactions.length === 0) return [];
        const grouped = walletState.transactions.reduce((acc, transaction) => {
            const dateObj = DateUtils.timestampToDate(transaction.date);
            const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            if (!acc[dateString]) acc[dateString] = [];
            acc[dateString].push(transaction);
            return acc;
        }, {});
        return Object.keys(grouped)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => ({ title: date, data: grouped[date] }));
    }, [walletState.transactions]);

    // 🌟 THE FIX: Inject "You" at the very top of the active members list!
    // Since `wallet.jsx` dynamically maps over this array, "You" will automatically render at the top without touching UI code!
    const activeMembers = [
        { id: userId, name: 'You' }, 
        ...(walletState.otherMembers || [])
    ];
    
    const percentSpent = walletState.budgetData?.totalBudget > 0 ? Math.floor((walletState.budgetData.totalSpent / walletState.budgetData.totalBudget) * 100) : 0;
    const isNetPositive = walletState.myBalance >= 0;
    const formattedNetBalance = `${isNetPositive ? '+' : '-'}${currencySymbol || '$'}${Math.abs(walletState.myBalance || 0).toFixed(2)}`;

    const saveExpenseMutation = useMutation({
        mutationFn: async (formPayload) => {
            const selectedCategory = WALLET_CATEGORIES.find(c => c.id === formPayload.categoryId);
            const categoryName = selectedCategory ? selectedCategory.name : 'Other';

            const { data: newExpense, error: expenseError } = await supabase
                .from('Expenses')
                .insert({
                    trip_id: tripId,
                    paid_by: userId,
                    total_amount: parseFloat(formPayload.amount),
                    description: formPayload.title,
                    category: categoryName,
                    currency: currencySymbol || 'USD'
                })
                .select()
                .single();

            if (expenseError) throw expenseError;

            const splitInserts = [];
            
            if (formPayload.isSplitEqually) {
                // 🌟 THE FIX: We no longer magically add "+ 1" for the payer!
                // We ONLY divide by the exact amount of boxes checked in the UI.
                const selectedUserIds = Object.keys(formPayload.splits);
                const totalPeople = selectedUserIds.length; 
                
                if (totalPeople > 0) {
                    const splitAmount = (parseFloat(formPayload.amount) / totalPeople).toFixed(2);
                    
                    // Add splits strictly for the checked members (which includes "You" if you left yourself checked)
                    selectedUserIds.forEach(memberId => {
                        splitInserts.push({ expense_id: newExpense.expense_id, user_id: memberId, amount_owed: splitAmount });
                    });
                }
            } else {
                Object.keys(formPayload.splits).forEach(splitUserId => {
                    const amt = parseFloat(formPayload.splits[splitUserId]);
                    if (amt > 0) {
                        splitInserts.push({
                            expense_id: newExpense.expense_id,
                            user_id: splitUserId,
                            amount_owed: amt
                        });
                    }
                });
            }

            if (splitInserts.length > 0) {
                const { error: splitsError } = await supabase
                    .from('Expense_Splits')
                    .insert(splitInserts);
                if (splitsError) throw splitsError;
            }

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet', tripId] });
            setModalVisible(false);
            setExpenseForm(defaultFormState);
        },
        onError: (error) => {
            console.error("Failed to save expense:", error);
            Alert.alert("Error", "Could not save transaction.");
        }
    });

    const isFormValid = () => {
        return expenseForm.title.trim() !== '' && 
               expenseForm.amount !== '' && 
               expenseForm.categoryId !== null;
    };

    const handleSaveExpense = () => {
        if (!isFormValid()) return;
        saveExpenseMutation.mutate(expenseForm); 
    };

    const handleOpenAdd = () => {
        const initialSplits = {};
        activeMembers.forEach(m => {
            initialSplits[m.id] = ''; 
        });

        setExpenseForm({
            ...defaultFormState,
            splits: initialSplits
        });
        setModalVisible(true);
    };

    const handleTransactionLongPress = (tx) => {
        setExpandedTxId(tx.id === expandedTxId ? null : tx.id);
    };

    const handleUpdateSplit = (userId, splitData) => {
        setExpenseForm(prev => {
            const newSplits = { ...prev.splits };
            
            if (splitData.selected) {
                newSplits[userId] = splitData.amount; 
            } else {
                delete newSplits[userId];
            }

            return {
                ...prev,
                splits: newSplits
            };
        });
    };

    return {
        walletState,
        isFetchingWallet,
        isRefreshing: isFetching && !isFetchingWallet, 
        isModalVisible,
        setModalVisible,
        expenseForm,
        setExpenseForm,
        expandedTxId,
        setExpandedTxId,
        fetchWalletData, 
        groupedTransactions,
        activeMembers,
        percentSpent,
        isNetPositive,
        formattedNetBalance,
        handleOpenAdd,
        handleTransactionLongPress,
        isFormValid,        
        handleSaveExpense,
        handleUpdateSplit,
        isSaving: saveExpenseMutation.isPending 
    };
}