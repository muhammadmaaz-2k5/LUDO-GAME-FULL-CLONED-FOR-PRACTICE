import { useNotificationStore } from '../../store/useNotificationStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
        let borderStyle = 'border-cyan-500/30 bg-stone-900/95 text-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />;
          borderStyle = 'border-green-500/40 bg-stone-900/95 text-white';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          borderStyle = 'border-red-500/40 bg-stone-900/95 text-white';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderStyle = 'border-amber-500/40 bg-stone-900/95 text-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${borderStyle}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <p className="text-xs font-semibold leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
