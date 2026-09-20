import { supabase } from '../config/supabase';

// Helper for UUID generation if needed (usually DB handles this, but for mocking we'll need it)
const generateUUID = () => crypto.randomUUID();

export const ledgerService = {
  // Create normal event (Deposit/Withdrawal)
  createEntry: async ({ accountId, amountFloat, referenceCode }) => {
    const amountInt = Math.round(amountFloat * 100);
    
    // In a real app, session_id comes from context or auth
    const mockSessionId = '00000000-0000-0000-0000-000000000000'; 
    
    const { data, error } = await supabase
      .from('ledger_event')
      .insert([{
        account_id: accountId,
        session_id: mockSessionId,
        amount: amountInt,
        reference_code: referenceCode || 'MANUAL_ENTRY'
      }]);
    return { data, error };
  },

  // Append Reversal
  appendReversal: async ({ originalEventId, amountFloat, reason }) => {
    const amountInt = Math.round(amountFloat * 100);
    const mockSessionId = '11111111-1111-1111-1111-111111111111'; 

    const { data, error } = await supabase
      .from('compensating_transaction')
      .insert([{
        original_event_id: originalEventId,
        session_id: mockSessionId,
        amount: amountInt, // Should be exact inverse (e.g. -originalAmountInt)
        reason: reason
      }]);
    return { data, error };
  },

  // Fetch all immutable logs
  getAuditTrail: async () => {
    // We fetch all ledger_events, and also pull any linked compensating_transactions
    // using Supabase foreign key nested joins.
    const { data, error } = await supabase
      .from('ledger_event')
      .select(`
        *,
        compensating_transaction (
          id, amount, reason, created_at
        )
      `)
      .order('created_at', { ascending: false });
      
    return { data, error };
  },

  // Dynamic balance calculation
  calculateBalance: async (accountId) => {
    // Fetch all events for account
    const { data: events, error: eventErr } = await supabase
      .from('ledger_event')
      .select('id, amount')
      .eq('account_id', accountId);

    if (eventErr) return { balanceFloat: 0, error: eventErr };

    // Fetch all compensating transactions for these events
    // (If the DB is large, an RPC function is better, but this works for MVP)
    const eventIds = events.map(e => e.id);
    let compTotal = 0;
    
    if (eventIds.length > 0) {
      const { data: comps, error: compErr } = await supabase
        .from('compensating_transaction')
        .select('amount')
        .in('original_event_id', eventIds);
        
      if (!compErr && comps) {
        compTotal = comps.reduce((acc, curr) => acc + curr.amount, 0);
      }
    }

    const eventTotal = events.reduce((acc, curr) => acc + curr.amount, 0);
    const totalInt = eventTotal + compTotal;
    
    return { balanceFloat: totalInt / 100, error: null };
  },

  // Realtime Subscriptions
  subscribeToAccount: (accountId, callback) => {
    const channel = supabase.channel(`account_${accountId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ledger_event', filter: `account_id=eq.${accountId}` }, callback)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'compensating_transaction' }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  subscribeToAll: (callback) => {
    const channel = supabase.channel('global_audit')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ledger_event' }, callback)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'compensating_transaction' }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
