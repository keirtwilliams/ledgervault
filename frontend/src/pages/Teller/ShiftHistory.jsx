import React, { useState, useEffect } from 'react';
import { History, ShieldCheck } from 'lucide-react';
import { ledgerService } from '../../services/ledgerService';
import { cn } from '../../utils/cn';

const ShiftHistory = () => {
  const [events, setEvents] = useState([]);
  
  const fetchShiftData = async () => {
    // In our demo, teller session is '00000000-0000-0000-0000-000000000000'
    const { data } = await ledgerService.getAuditTrail();
    if (data) {
      // Filter for current teller session
      const shiftEvents = data.filter(e => e.session_id === '00000000-0000-0000-0000-000000000000');
      setEvents(shiftEvents);
    }
  };

  useEffect(() => {
    fetchShiftData();
    const unsubscribe = ledgerService.subscribeToAll(() => {
      fetchShiftData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shift History</h1>
          <p className="text-slate-500 mt-1">Your personal transaction log for the current active shift.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            My Ledger Commits
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 uppercase tracking-wider text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Event ID</th>
                <th className="px-6 py-4">Timestamp (UTC)</th>
                <th className="px-6 py-4">Ref Code</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {events.map((ev) => {
                const isReversed = ev.compensating_transaction && ev.compensating_transaction.length > 0;
                const evAmountFloat = ev.amount / 100;

                return (
                  <tr key={ev.id} className={cn("hover:bg-slate-50 transition-colors", isReversed && "bg-slate-50 opacity-60")}>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{ev.id}</td>
                    <td className="px-6 py-4">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{ev.reference_code}</td>
                    <td className="px-6 py-4 font-mono">{ev.account_id}</td>
                    <td className={cn(
                      "px-6 py-4 font-bold text-right",
                      evAmountFloat > 0 ? "text-emerald-600" : "text-slate-900",
                      isReversed && "line-through decoration-slate-400"
                    )}>
                      {evAmountFloat > 0 ? '+' : ''}₱{Math.abs(evAmountFloat).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {isReversed ? (
                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                           <ShieldCheck className="w-3 h-3" /> Reversed
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                           Committed
                         </span>
                       )}
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No shift activity recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShiftHistory;
