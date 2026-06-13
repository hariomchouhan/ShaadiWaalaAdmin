import { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, Sparkles } from 'lucide-react';

export default function AIModal({ isOpen, onClose, aiInputText, setAiInputText, onExtract, isProcessing }) {
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

  const handleClose = () => { clearFile(); onClose(); };
  const canExtract = (aiInputText.trim().length > 0 || aiFile) && !isProcessing;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-panel sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-gold/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-brand-text">AI Parser</h3>
              <p className="text-xs text-brand-muted">Auto-fill form from biodata</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 sw-btn-ghost rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="modal-body space-y-4">
          <div
            className="border-2 border-dashed border-brand-gold/30 rounded-xl p-5 text-center hover:bg-brand-gold/5 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={handleFileSelect} disabled={isProcessing} />
            {aiFile ? (
              <div className="flex items-center justify-center gap-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-brand-gold/20" />
                ) : (
                  <FileText className="w-10 h-10 text-brand-gold" />
                )}
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-brand-text truncate">{aiFile.name}</p>
                  <p className="text-xs text-brand-muted">{(aiFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); clearFile(); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-brand-gold mx-auto mb-2" />
                <p className="text-sm font-medium text-brand-text">Upload PDF or Image</p>
                <p className="text-xs text-brand-muted mt-1">PDF, JPG, PNG, WEBP · max 10MB</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 gold-divider" />
            <span className="text-[10px] text-brand-muted uppercase tracking-widest">or paste text</span>
            <div className="flex-1 gold-divider" />
          </div>

          <textarea
            className="sw-input h-28 resize-none"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            placeholder="Paste biodata text here..."
            disabled={isProcessing}
          />
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} disabled={isProcessing} className="sw-btn-secondary px-4 py-2.5 text-sm w-full sm:w-auto">Cancel</button>
          <button onClick={() => onExtract({ text: aiInputText, file: aiFile })} disabled={!canExtract} className="sw-btn-primary px-5 py-2.5 text-sm w-full sm:w-auto">
            {isProcessing ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
            ) : (
              'Extract Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
