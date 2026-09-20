import React from 'react';
import { X, CheckCircle2, AlertOctagon } from 'lucide-react';
import { cn } from '../../utils/cn';

const AlertModal = ({ isOpen, onClose, type = 'error', title, message }) => {
  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 transform transition-all scale-100 opacity-100">
        <div className={cn(
          "px-6 py-4 flex items-center gap-3 border-b",
          isError ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
        )}>
          {isError ? (
            <AlertOctagon className="w-6 h-6 text-red-600" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          )}
          <h3 className={cn(
            "font-bold text-lg",
            isError ? "text-red-900" : "text-emerald-900"
          )}>
            {title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {message}
          </p>
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className={cn(
                "px-6 py-2.5 rounded-lg font-semibold text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
                isError 
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-600" 
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
              )}
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
