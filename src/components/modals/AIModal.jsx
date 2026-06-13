import { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AIModal({
  isOpen,
  onClose,
  aiInputText,
  setAiInputText,
  onExtract,
  isProcessing,
}) {
  const [aiFile, setAiFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const clearFile = () => {
    setAiFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAiFile(file);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  };

  const handleClose = () => {
    clearFile();
    onClose();
  };

  const handleExtract = () => {
    onExtract({ text: aiInputText, file: aiFile });
  };

  const canExtract = (aiInputText.trim().length > 0 || aiFile) && !isProcessing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-sm w-full max-w-lg p-6 border border-brand-gold/15 card-shadow">
        <h3 className="font-display font-bold text-lg mb-1 text-brand-text">AI Parser</h3>
        <p className="text-xs text-brand-muted mb-4">
          Paste text or upload a biodata PDF / image — fields will auto-fill in the form.
        </p>

        <div
          className="mb-4 border-2 border-dashed border-brand-gold/30 rounded-sm p-4 text-center hover:bg-brand-surface transition-colors cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
          {aiFile ? (
            <div className="flex items-center justify-center gap-3">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-sm border border-brand-gold/20" />
              ) : (
                <FileText className="w-10 h-10 text-brand-gold" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-brand-text truncate max-w-[200px]">{aiFile.name}</p>
                <p className="text-xs text-brand-muted">{(aiFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="p-1 hover:bg-red-50 rounded-sm text-red-500"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-brand-gold mx-auto mb-2" />
              <p className="text-sm text-brand-text font-medium">Upload PDF or Image</p>
              <p className="text-xs text-brand-muted mt-1">PDF, JPG, PNG, WEBP · max 10MB</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-brand-gold/20" />
          <span className="text-xs text-brand-muted uppercase tracking-wider">or paste text</span>
          <div className="flex-1 h-px bg-brand-gold/20" />
        </div>

        <textarea
          className="sw-input h-32 mb-4 resize-none"
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
          placeholder="Paste biodata text here..."
          disabled={isProcessing}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="sw-btn-secondary px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={!canExtract}
            className="sw-btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Extract Data
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
