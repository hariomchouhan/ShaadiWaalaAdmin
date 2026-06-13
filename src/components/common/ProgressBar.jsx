export default function ProgressBar({ value = 0, max = 100, label, showPercent = true, indeterminate = false }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {label && <span className="text-xs text-brand-muted font-medium truncate">{label}</span>}
          {showPercent && !indeterminate && (
            <span className="text-xs font-semibold text-brand-gold shrink-0">{pct}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-brand-brown-deep rounded-full overflow-hidden border border-brand-gold/10">
        {indeterminate ? (
          <div className="h-full w-1/3 bg-brand-gold rounded-full animate-[sw-progress_1.2s_ease-in-out_infinite]" />
        ) : (
          <div
            className="h-full bg-brand-gold rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      {!indeterminate && max > 0 && (
        <p className="text-[10px] text-brand-muted mt-1 text-right">
          {value} / {max}
        </p>
      )}
    </div>
  );
}
