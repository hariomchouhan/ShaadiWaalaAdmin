export default function AIModal({
  isOpen,
  onClose,
  aiInputText,
  setAiInputText,
  onExtract,
  isProcessing,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 border border-brand-primary/10">
        <h3 className="font-bold text-lg mb-4 text-brand-dark">AI Parser</h3>
        <textarea
          className="sw-input h-40 mb-4 resize-none focus:ring-brand-primary"
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
          placeholder="Paste biodata text here..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onExtract}
            disabled={isProcessing}
            className="sw-btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Extract V2 (Test)'}
          </button>
        </div>
      </div>
    </div>
  );
}
