import React from 'react';
import DynamicIcon from '../ui/DynamicIcon';

const LedgerActionPanel = () => {
  return (
    <div className="max-w-md mx-auto border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-black flex items-center gap-2">
          <DynamicIcon name="DASHBOARD" className="w-6 h-6" />
          Actions
        </h2>
        <div className="flex gap-2">
          <DynamicIcon name="USER_TELLER" className="w-5 h-5 text-black" title="Teller Active" />
          <DynamicIcon name="USER_AUDITOR" className="w-5 h-5 text-gray-300" title="Auditor Offline" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Deposit Button - Stark Black */}
        <button className="w-full group flex items-center justify-between border-2 border-black bg-black text-white px-4 py-3 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide">
          <span className="flex items-center gap-3">
            <DynamicIcon name="DEPOSIT" className="w-5 h-5" />
            Log Deposit
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>

        {/* Withdrawal Button - Stark White */}
        <button className="w-full group flex items-center justify-between border-2 border-black bg-white text-black px-4 py-3 hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide">
          <span className="flex items-center gap-3">
            <DynamicIcon name="WITHDRAWAL" className="w-5 h-5" />
            Log Withdrawal
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-dashed border-black">
        {/* Reversal Button */}
        <button className="w-full flex items-center justify-center gap-2 text-black hover:bg-gray-100 px-4 py-2 font-bold uppercase text-sm border-2 border-transparent hover:border-black transition-all">
          <DynamicIcon name="COMPENSATING_REVERSAL" className="w-4 h-4" />
          Append Reversal
        </button>
        
        {/* Audit Trail Button */}
        <button className="w-full mt-2 flex items-center justify-center gap-2 text-black hover:underline px-4 py-2 font-bold uppercase text-xs">
          <DynamicIcon name="LEDGER_AUDIT_TRAIL" className="w-4 h-4" />
          View Audit Trail
        </button>
      </div>
    </div>
  );
};

export default LedgerActionPanel;
