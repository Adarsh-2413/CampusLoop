import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 text-white border-slate-700';
        let IconComponent = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-800 text-white border-emerald-600';
          IconComponent = CheckCircle2;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-800 text-white border-rose-600';
          IconComponent = AlertCircle;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-800 text-white border-amber-600';
          IconComponent = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm backdrop-blur-md transition-all duration-300 animate-slide-up ${bgStyle}`}
          >
            <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
