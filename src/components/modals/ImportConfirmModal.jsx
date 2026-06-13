export default function ImportConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white p-6 rounded-xl border border-brand-primary/10 shadow-xl max-w-sm w-full">
        <h3 className="font-bold text-lg text-brand-dark mb-2">Import?</h3>
        <p className="text-gray-500 text-sm mb-6">
          This will import profiles from the selected CSV file.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button onClick={onConfirm} className="sw-btn-primary px-4 py-2">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
