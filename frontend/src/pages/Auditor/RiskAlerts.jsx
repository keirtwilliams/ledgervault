import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { ledgerService } from '../../services/ledgerService';
import { cn } from '../../utils/cn';

const RiskAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    const { data } = await ledgerService.getAuditTrail();
    if (data) {
      // Logic for alerts:
      // 1. High value > ₱50,000 (amount in centavos > 5000000)
      // 2. Reversed transaction
      
      const flagged = [];
      data.forEach(ev => {
        const isReversed = ev.compensating_transaction && ev.compensating_transaction.length > 0;
        const absAmount = Math.abs(ev.amount);
        
        if (isReversed) {
          flagged.push({
            ...ev,
            riskType: 'COMPLIANCE_REVERSAL',
            riskLabel: 'Auditor Reversal Applied',
            riskColor: 'text-rose-600',
            riskBg: 'bg-rose-50 border-rose-100'
          });
        } else if (absAmount > 500000000) {
          flagged.push({
            ...ev,
            riskType: 'HIGH_VALUE_TX',
            riskLabel: 'High Value Threshold Exceeded (₱5M+)',
            riskColor: 'text-amber-600',
            riskBg: 'bg-amber-50 border-amber-100'
          });
        }
      });
      
      setAlerts(flagged);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const unsubscribe = ledgerService.subscribeToAll(() => {
      fetchAlerts();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk & Alerts</h1>
          <p className="text-slate-500 mt-1">Automated anomaly detection and high-value transaction monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border border-slate-200">
             <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3" />
             <p className="text-slate-600 font-medium">No active risk alerts.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const evAmountFloat = alert.amount / 100;
            return (
              <div key={alert.id} className={cn("p-5 rounded-xl border flex items-start gap-4", alert.riskBg)}>
                <div className="p-2 bg-white/60 rounded-full shadow-sm mt-1">
                  {alert.riskType === 'HIGH_VALUE_TX' ? (
                    <AlertTriangle className={cn("w-6 h-6", alert.riskColor)} />
                  ) : (
                    <AlertCircle className={cn("w-6 h-6", alert.riskColor)} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn("font-bold", alert.riskColor)}>{alert.riskLabel}</h3>
                    <span className="text-xs font-semibold text-slate-500">{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account ID</p>
                      <p className="font-mono text-sm font-medium mt-0.5">{alert.account_id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event ID</p>
                      <p className="font-mono text-sm font-medium mt-0.5">{alert.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</p>
                      <p className="font-bold text-slate-900 mt-0.5">₱{Math.abs(evAmountFloat).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>
                  
                  {alert.riskType === 'COMPLIANCE_REVERSAL' && alert.compensating_transaction[0] && (
                     <div className="mt-4 p-3 bg-white/60 rounded border border-rose-100/50">
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reversal Reason Logged</p>
                       <p className="text-sm font-medium text-slate-700 italic">"{alert.compensating_transaction[0].reason}"</p>
                     </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RiskAlerts;
