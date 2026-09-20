import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock, Plus, Minus, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ledgerService } from '../../services/ledgerService';
import AlertModal from '../../components/ui/AlertModal';

const BalanceDisplayWidget = ({ balanceFloat }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden">
    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Balance</span>
    <div className="flex items-end gap-2">
      <span className="text-4xl font-bold text-slate-900">
        ₱{balanceFloat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className="text-sm font-medium text-emerald-600 mb-1">Real-time</span>
    </div>
    <p className="text-xs text-slate-400 mt-2">Dynamically calculated from all historical events</p>
  </div>
);

const Dashboard = () => {
  const [accountId, setAccountId] = useState('111111');
  const [amountStr, setAmountStr] = useState('');
  const [balanceFloat, setBalanceFloat] = useState(0);
  const [transactionType, setTransactionType] = useState('deposit');
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const fetchDashboardData = async () => {
    const { data: trailData } = await ledgerService.getAuditTrail();
    if (trailData) {
      setRecentEvents(trailData.slice(0, 10)); // Top 10 recent
    }

    const { balanceFloat: newBalance } = await ledgerService.calculateBalance(accountId);
    setBalanceFloat(newBalance || 0);
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup realtime listener
    const unsubscribe = ledgerService.subscribeToAccount(accountId, () => {
      fetchDashboardData();
    });

    return () => unsubscribe();
  }, [accountId]);

  const handleCommit = async (e) => {
    e.preventDefault();

    if (!accountId || accountId.trim() === '') {
      setModalState({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Please enter a valid Account ID in the top right search bar before committing a transaction.' });
      return;
    }

    const parsedAmount = parseFloat(amountStr);
    if (!parsedAmount || isNaN(parsedAmount)) {
      setModalState({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Please enter a valid amount.' });
      return;
    }
    
    const finalAmountFloat = transactionType === 'deposit' ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);
    setIsLoading(true);

    const { error } = await ledgerService.createEntry({ 
      accountId, 
      amountFloat: finalAmountFloat, 
      referenceCode: 'UI_ENTRY' 
    });
    
    if (error) {
      setModalState({ isOpen: true, type: 'error', title: 'Transaction Failed', message: error.message });
    } else {
      setModalState({ isOpen: true, type: 'success', title: 'Ledger Updated', message: `Successfully committed ${transactionType.toUpperCase()} of ₱${parsedAmount} to account ${accountId}.` });
      setAmountStr('');
      await fetchDashboardData();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teller Command Center</h1>
          <p className="text-slate-500 mt-1">Process transactions and update the immutable ledger.</p>
        </div>
      </div>

      <AlertModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <BalanceDisplayWidget balanceFloat={balanceFloat} />
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Transaction</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setTransactionType('deposit')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  transactionType === 'deposit' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Plus className="w-4 h-4" /> Deposit
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('withdrawal')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  transactionType === 'withdrawal' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Minus className="w-4 h-4" /> Withdrawal
              </button>
            </div>

            <form onSubmit={handleCommit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Account ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm font-semibold text-slate-900 placeholder:text-slate-300 transition-all"
                    placeholder="e.g. 111111"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-semibold sm:text-lg">₱</span>
                  </div>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="block w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-lg text-slate-900 placeholder:text-slate-300 transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70",
                  transactionType === 'deposit' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-900"
                )}
              >
                {transactionType === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                {isLoading ? 'Committing...' : 'Commit to Ledger'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900">Your Shift Activity</h2>
              <span className="text-xs font-medium bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Live
              </span>
            </div>
            
            <ul className="divide-y divide-slate-100">
              {recentEvents.length === 0 ? (
                <li className="p-8 text-center text-slate-500">No events found.</li>
              ) : recentEvents.map((event) => {
                const isDeposit = event.amount > 0;
                // Live DB is in centavos, convert to float for display
                const amountFloat = event.amount / 100;
                
                return (
                  <li key={event.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-full flex-shrink-0",
                        isDeposit ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                      )}>
                        {isDeposit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {isDeposit ? 'Deposit' : 'Withdrawal'}
                          </p>
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded tracking-wider">
                            {event.reference_code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {new Date(event.created_at).toLocaleString()} <span className="mx-1">•</span> <span className="font-mono text-slate-400">ID: {event.id.split('-')[0]}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-base font-bold",
                        isDeposit ? "text-emerald-600" : "text-slate-900"
                      )}>
                        {isDeposit ? '+' : '-'}₱{Math.abs(amountFloat).toFixed(2)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
