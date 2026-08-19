import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-green-500/20 animate-ping" />
        <Loader2 className="w-8 h-8 text-green-500 animate-spin absolute" />
      </div>
      {text && <p className="text-xs font-semibold text-textSecondary">{text}</p>}
    </div>
  );
}
