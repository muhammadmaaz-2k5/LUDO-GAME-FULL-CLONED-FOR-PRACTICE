import { AlertCircle, X } from 'lucide-react';

export function ErrorBanner({ message, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs shadow-lg animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        <span className="font-semibold">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 p-1 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
