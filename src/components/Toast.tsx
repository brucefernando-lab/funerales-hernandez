import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none flex flex-col items-center px-4 space-y-2 max-w-md mx-auto">
      {toasts.map((toast) => {
        let borderClass = 'border-amber-500/50 bg-slate-900/95';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/60 bg-slate-900/95';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/60 bg-slate-900/95';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/60 bg-slate-900/95';
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all transform animate-in fade-in slide-in-from-top-4 duration-200 text-slate-100 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              <div className="font-semibold text-white">{toast.title}</div>
              {toast.message && <div className="text-xs text-slate-300 mt-0.5">{toast.message}</div>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
