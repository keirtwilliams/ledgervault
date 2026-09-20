import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, TrendingUp, Search, Filter, RefreshCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ledgerService } from '../../services/ledgerService';
import AlertModal from '../../components/ui/AlertModal';

const Compliance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const fetchAuditTrail = async () => {
    const { data } = await ledgerService.getAuditTrail();
    if (data) setEvents(data);
  };

  useEffect(() => {
    fetchAuditTrail();
    
    // Setup realtime listener
    const unsubscribe = ledgerService.subscribeToAll(() => {
      fetchAuditTrail();
    });

    return () => unsubscribe();
  }, []);
  
  const handleAppendReversal = async () => {
    setIsLoading(true);
    // Real DB has selectedEvent.amount in centavos. We want the EXACT opposite float to pass to the service (which multiplies by 100).
    const floatAmount = selectedEvent.amount / 100;
    const inverseFloat = floatAmount * -1;
    
    const { error } = await ledgerService.appendReversal({
      originalEventId: selectedEvent.id,
      amountFloat: inverseFloat,
      reason: reversalReason
    });

    if (error) {
      setModalState({ isOpen: true, type: 'error', title: 'Reversal Failed', message: error.message });
    } else {
      setModalState({ isOpen: true, type: 'success', title: 'Reversal Appended', message: 'The compensating transaction has been permanently appended to the ledger.' });
      setSelectedEvent(null);
      setReversalReason('');
      await fetchAuditTrail();
    }
    setIsLoading(false);
  };

  // Derive metrics from live data
  const grossDeposits = events.filter(e => e.amount > 0).reduce((acc, curr) => acc + curr.amount, 0) / 100;
  const grossWithdrawals = events.filter(e => e.amount < 0).reduce((acc, curr) => acc + curr.amount, 0) / 100;
  const reversalsAppended = events.filter(e => e.compensating_transaction && e.compensating_transaction.length > 0).length;

  return (
    <div className="space-y-6 relative">
      <AlertModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Portal</h1>
          <p className="text-slate-500 mt-1">Audit the immutable chronological ledger and append compensating transactions.</p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Gross Deposits</p>
            <p className="text-2xl font-bold text-slate-900">₱{grossDeposits.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <RefreshCcw className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Gross Withdrawals</p>
            <p className="text-2xl font-bold text-slate-900">₱{Math.abs(grossWithdrawals).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Reversals Appended</p>
            <p className="text-2xl font-bold text-slate-900">{reversalsAppended}</p>
          </div>
        </div>
      </div>

      {/* Global Ledger Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            Global Chronological Ledger
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 uppercase tracking-wider text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Event ID</th>
                <th className="px-6 py-4">Timestamp (UTC)</th>
                <th className="px-6 py-4">Ref Code</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {events.map((ev) => {
                const isReversed = ev.compensating_transaction && ev.compensating_transaction.length > 0;
                const evAmountFloat = ev.amount / 100;

                return (
                  <tr key={ev.id} className={cn("hover:bg-slate-50 transition-colors", isReversed && "bg-slate-50 opacity-60 line-through decoration-slate-400")}>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{ev.id}</td>
                    <td className="px-6 py-4">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{ev.reference_code}</td>
                    <td className={cn(
                      "px-6 py-4 font-bold",
                      evAmountFloat > 0 ? "text-emerald-600" : "text-slate-900"
                    )}>
                      {evAmountFloat > 0 ? '+' : ''}₱{Math.abs(evAmountFloat).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono">{ev.account_id}</td>
                    <td className="px-6 py-4 text-right">
                      {!isReversed ? (
                        <button 
                          onClick={() => setSelectedEvent(ev)}
                          className="text-amber-600 hover:text-amber-700 font-semibold hover:bg-amber-50 px-3 py-1.5 rounded transition-colors"
                        >
                          Flag / Reverse
                        </button>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-amber-600 font-bold uppercase">Reversed</span>
                          <span className="text-[10px] text-slate-500">{ev.compensating_transaction[0].reason}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No events found in live database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditor Reversal Modal Overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-amber-500 p-4 text-white flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">Append Compensating Transaction</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm">
                You are about to flag event <strong className="font-mono text-slate-900">{selectedEvent.id}</strong> as erroneous. This action is <strong className="text-slate-900">permanent</strong>.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Original Amount:</span>
                  <span className="font-bold text-slate-900">₱{Math.abs(selectedEvent.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Compensating Reversal:</span>
                  <span className="font-bold text-amber-600">₱{Math.abs(selectedEvent.amount / 100).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for Reversal</label>
                <textarea 
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Teller entry typo..."
                  rows="3"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAppendReversal}
                  disabled={!reversalReason.trim() || isLoading}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Confirm Reversal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;
