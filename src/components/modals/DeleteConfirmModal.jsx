import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ deleteTarget, onCancel, onConfirm }) {
  if (!deleteTarget) return null;

  const isDeleteAll = deleteTarget === 'ALL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full border border-brand-primary/10">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="font-bold text-xl text-brand-dark mb-2">
            {isDeleteAll ? 'Delete Database?' : 'Delete Profile?'}
          </h3>
          <p className="text-gray-500 mb-6">
            {isDeleteAll
              ? 'This will permanently delete ALL profiles. This action cannot be undone.'
              : 'Are you sure you want to remove this candidate?'}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
