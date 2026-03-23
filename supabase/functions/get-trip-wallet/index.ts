import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { tripId, userId } = await req.json();
    if (!tripId || !userId) throw new Error("Missing tripId or userId");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    );

    const [tripResponse, expensesResponse] = await Promise.all([
      supabase.from('Trips').select(`target_budget, Trip_Members (user_id, Users (user_id, first_name, last_name, avatar_url))`).eq('trip_id', tripId).single(),
      supabase.from('Expenses').select(`expense_id, total_amount, category, description, expense_date, paid_by, Users!expenses_payer_id_fkey (first_name, last_name), Expense_Splits (user_id, amount_owed)`).eq('trip_id', tripId).order('expense_date', { ascending: false })
    ]);

    if (tripResponse.error) throw tripResponse.error;
    if (expensesResponse.error) throw expensesResponse.error;

    const trip = tripResponse.data;
    const expenses = expensesResponse.data || [];

    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.total_amount), 0);
    const budgetData = { totalBudget: Number(trip.target_budget) || 0, totalSpent };

    const transactions = expenses.map(exp => {
      const payerName = exp.Users ? `${exp.Users.first_name} ${exp.Users.last_name}`.trim() : 'Unknown';
      return {
        id: exp.expense_id,
        icon: exp.category || 'receipt',
        title: exp.description || 'Untitled Expense',
        payer: payerName,
        split: `Split with ${exp.Expense_Splits?.length || 0} others`,
        amount: Number(exp.total_amount)
      };
    });

// --- UPDATED: STRICT 1-ON-1 LEDGER LOGIC ---
    const userRelationships: Record<string, { id: string, name: string, avatar: string, balance: number }> = {};
    
    // 1. Setup a ledger for all other members relative to YOU
    trip.Trip_Members.forEach(member => {
      if (member.user_id !== userId) {
        userRelationships[member.user_id] = {
          id: member.user_id,
          name: `${member.Users.first_name} ${member.Users.last_name}`.trim(),
          avatar: member.Users.avatar_url || "https://i.pravatar.cc/150",
          balance: 0 // POSITIVE = They owe you. NEGATIVE = You owe them.
        };
      }
    });

    // 2. Process expenses based on your exact database rules
    expenses.forEach(exp => {
      const payerId = exp.paid_by;
      const splits = exp.Expense_Splits || [];

      if (payerId === userId) {
        // SCENARIO A: YOU paid the expense.
        // Everyone in the Expense_Splits table owes YOU money.
        splits.forEach((split: any) => {
          if (userRelationships[split.user_id]) {
            // Add the exact amount they owe you to their ledger
            userRelationships[split.user_id].balance += Number(split.amount_owed || 0);
          }
        });
      } else {
        // SCENARIO B: SOMEONE ELSE paid the expense.
        // Check if YOU are in the Expense_Splits table for this expense.
        const mySplit = splits.find((s: any) => s.user_id === userId);
        
        if (mySplit && userRelationships[payerId]) {
          // You owe the payer this exact amount.
          // Subtract from the payer's ledger (Negative means you owe them)
          userRelationships[payerId].balance -= Number(mySplit.amount_owed || 0);
        }
      }
    });

    const otherMembers = Object.values(userRelationships);
    
    // Your Net Standing is the sum of your 1-on-1 balances
    const myBalance = otherMembers.reduce((sum, member) => sum + member.balance, 0);
    
    return new Response(
      JSON.stringify({ budgetData, transactions, myBalance, otherMembers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    });
  }
});