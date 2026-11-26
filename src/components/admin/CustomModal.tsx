import { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface ModalConfig {
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
}: ModalConfig) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        (onCancel ?? onConfirm)();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const isDestructive = type === 'warning' || type === 'error' || type === 'confirm';

  const iconBg =
    type === 'success'
      ? 'bg-emerald-50 text-emerald-600'
      : type === 'error'
      ? 'bg-rose-50 text-rose-600'
      : type === 'warning' || type === 'confirm'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-sky-50 text-[#006cb7]';

  const renderIcon = () => {
    if (type === 'success') return <CheckCircle2 className="w-6 h-6" />;
    if (type === 'error') return <AlertCircle className="w-6 h-6" />;
    if (type === 'warning' || type === 'confirm') return <AlertTriangle className="w-6 h-6" />;
    return <Info className="w-6 h-6" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      onClick={() => (onCancel ?? onConfirm)()}
    >
      <div
        className="bg-white border border-slate-100 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{renderIcon()}</div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-[#006cb7] hover:bg-[#005ba1] shadow-[#006cb7]/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
