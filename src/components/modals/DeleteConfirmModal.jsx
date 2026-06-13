import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({ deleteTarget, onCancel, onConfirm, isDeleting = false }) {
  if (!deleteTarget) return null;

  return (
    <div className="modal-overlay" onClick={isDeleting ? undefined : onCancel}>
      <div className="modal-panel sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body text-center py-8">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-display text-xl font-bold text-brand-text mb-2">Delete Profile?</h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            Are you sure you want to remove this candidate permanently?
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} disabled={isDeleting} className="sw-btn-secondary flex-1 py-2.5 text-sm disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="sw-btn-danger flex-1 py-2.5 text-sm font-semibold bg-red-600 text-white border-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Removing...
              </span>
            ) : (
              'Yes, Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
