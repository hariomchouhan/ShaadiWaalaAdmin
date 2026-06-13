import { Loader2 } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function OperationOverlay({ open, title, message, progress, indeterminate = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-brown/55 backdrop-blur-sm p-4">
      <div className="sw-card p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-brand-gold/20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold mx-auto mb-4" />
        <h3 className="font-display text-lg font-bold text-brand-text mb-1">{title}</h3>
        {message && <p className="text-sm text-brand-muted mb-5">{message}</p>}
        {(progress || indeterminate) && (
          <ProgressBar
            value={progress?.current ?? 0}
            max={progress?.total ?? 100}
            label={progress?.label}
            indeterminate={indeterminate && !progress?.total}
            showPercent={!!progress?.total}
          />
        )}
        <p className="text-xs text-brand-muted/80 mt-4">Please wait, do not close this window</p>
      </div>
    </div>
  );
}
