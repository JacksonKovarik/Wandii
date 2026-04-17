import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. Grab the user's authentication token from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing Authorization header");

    // EXTRACT THE RAW TOKEN: Strip out "Bearer " so it's just the JWT string
    const token = authHeader.replace('Bearer ', '').trim();

    // 2. Initialize Supabase
    // Keep the global header! This is still required so your DB queries obey RLS.
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    if (!anonKey) throw new Error('No ANON KEY');
    if (!url) throw new Error('No URL var');
    
    const supabase = createClient(url, anonKey, { 
      global: { headers: { Authorization: authHeader } } 
    });

    // 3. FORCE getUser() TO USE THE TOKEN DIRECTLY
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      // Adding a console log here just in case the token is actually expired
      console.error("Supabase Auth Error details:", authError);
      throw new Error("Unauthorized user");
    }
    
    const userId = user.id;

    // 4. We now only need the tripId from the frontend body
    const { tripId } = await req.json();
    if (!tripId) throw new Error("Missing tripId");

    const [tripResponse, expensesResponse] = await Promise.all([
      supabase.from('Trips').select(`target_budget, Trip_Members (user_id, Users (user_id, first_name, last_name, avatar_url))`).eq('trip_id', tripId).single(),
      supabase.from('Expenses').select(`expense_id, total_amount, category, description, expense_date, paid_by, Users!expenses_payer_id_fkey (first_name, last_name), Expense_Splits (user_id, amount_owed)`).eq('trip_id', tripId).order('expense_date', { ascending: false })
    ]);

    if (tripResponse.error) throw tripResponse.error;
    if (expensesResponse.error) throw expensesResponse.error;

    // Safety net: If RLS blocked the query, data will be null
    if (!tripResponse.data) throw new Error("Trip not found or access denied by RLS");

    const trip = tripResponse.data;
    const expenses = expensesResponse.data || [];

    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.total_amount), 0);
    const budgetData = { totalBudget: Number(trip.target_budget) || 0, totalSpent };

    const transactions = expenses.map((exp: any) => {
      const payerName = exp.Users ? `${exp.Users.first_name} ${exp.Users.last_name}`.trim() : 'Unknown';
      return {
        id: exp.expense_id,
        icon: exp.category || 'receipt',
        title: exp.description || 'Untitled Expense',
        payer: payerName,
        split: `Split with ${exp.Expense_Splits?.length || 0} others`,
        amount: Number(exp.total_amount),
        date: exp.expense_date
      };
    });

    // --- STRICT 1-ON-1 LEDGER LOGIC ---
    const userRelationships: Record<string, { id: string, name: string, avatar: string, balance: number }> = {};
    
    trip.Trip_Members.forEach((member: any) => {
      if (member.user_id !== userId) {
        userRelationships[member.user_id] = {
          id: member.user_id,
          // Added a fallback check here just in case RLS hides a user's profile
          name: member.Users ? `${member.Users.first_name} ${member.Users.last_name}`.trim() : 'Unknown User',
          avatar: member.Users?.avatar_url || '',
          balance: 0 
        };
      }
    });

    expenses.forEach((exp: any) => {
      const payerId = exp.paid_by;
      const splits = exp.Expense_Splits || [];

      if (payerId === userId) {
        splits.forEach((split: any) => {
          if (userRelationships[split.user_id]) {
            userRelationships[split.user_id].balance += Number(split.amount_owed || 0);
          }
        });
      } else {
        const mySplit = splits.find((s: any) => s.user_id === userId);
        if (mySplit && userRelationships[payerId]) {
          userRelationships[payerId].balance -= Number(mySplit.amount_owed || 0);
        }
      }
    });

    const otherMembers = Object.values(userRelationships);
    const myBalance = otherMembers.reduce((sum, member) => sum + member.balance, 0);
    
    return new Response(
      JSON.stringify({ budgetData, transactions, myBalance, otherMembers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error("Wallet Fetch Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    });
  }
});