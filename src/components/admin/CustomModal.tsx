import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function CustomModal({
  isOpen,
  type = 'info',
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}: CustomModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-rose-500" />;
      case 'warning':
      case 'confirm':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      default:
        return <Info className="w-6 h-6 text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-100 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-xs ${
              type === 'confirm' || type === 'warning'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
