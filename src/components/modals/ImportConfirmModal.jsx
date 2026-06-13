import { UploadCloud, Loader2 } from 'lucide-react';

export default function ImportConfirmModal({ onCancel, onConfirm, isImporting = false }) {
  return (
    <div className="modal-overlay" onClick={isImporting ? undefined : onCancel}>
      <div className="modal-panel sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body text-center py-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-5">
            <UploadCloud className="w-8 h-8 text-brand-gold" />
          </div>
          <h3 className="font-display text-xl font-bold text-brand-text mb-2">Import CSV?</h3>
          <p className="text-sm text-brand-muted">Profiles from the CSV file will be added to Firebase.</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} disabled={isImporting} className="sw-btn-secondary flex-1 py-2.5 text-sm disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isImporting} className="sw-btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
            {isImporting ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </span>
            ) : (
              'Import Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
