import { Camera, Plus, X, Loader2 } from 'lucide-react';
import ProfileFormFields from './ProfileFormFields';
import ProgressBar from '../common/ProgressBar';

function UploadZoneOverlay({ message, progress }) {
  return (
    <div className="absolute inset-0 z-20 bg-brand-bg/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 rounded-inherit p-3">
      <Loader2 className="w-7 h-7 animate-spin text-brand-gold" />
      <p className="text-xs font-medium text-brand-text text-center">{message}</p>
      {progress && (
        <div className="w-full max-w-[140px]">
          <ProgressBar value={progress.current} max={progress.total} showPercent={false} />
        </div>
      )}
    </div>
  );
}

export default function ProfileFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  currentProfile,
  onManualUpload,
  onGalleryUpload,
  onRemoveGalleryImage,
  galleryRef,
  expandedSection,
  setExpandedSection,
  isSaving = false,
  isUploadingAvatar = false,
  galleryUpload = null,
}) {
  if (!isOpen) return null;

  const busy = isSaving || isUploadingAvatar || galleryUpload?.active;
  const saveLabel = isSaving
    ? (currentProfile ? 'Updating Profile...' : 'Saving Profile...')
    : 'Save Profile';

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-panel sm:max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-brand-text">
              {currentProfile ? 'Edit Profile' : 'New Profile'}
            </h3>
            {formData.refId && (
              <p className="text-xs text-brand-muted mt-0.5">Ref ID: #{formData.refId}</p>
            )}
          </div>
          <button type="button" onClick={handleClose} disabled={busy} className="p-2 sw-btn-ghost rounded-full disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className={`modal-body ${isSaving ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-brand-gold/10">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-brand-surface rounded-xl overflow-hidden border-2 border-dashed border-brand-gold/30 hover:border-brand-gold transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                    onChange={onManualUpload}
                    disabled={busy}
                  />
                  <div className="w-full h-full flex items-center justify-center pointer-events-none">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-brand-gold/50 group-hover:text-brand-gold transition-colors" />
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <UploadZoneOverlay message="Uploading photo..." />
                  )}
                </div>
                <span className="text-xs text-brand-muted font-medium">Main Photo</span>
              </div>
              <div className="flex-1 min-w-0">
                <label className="sw-label">Gallery Photos</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {formData.gallery?.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] bg-brand-surface rounded-lg overflow-hidden group border border-brand-gold/10">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => onRemoveGalleryImage(idx)}
                        disabled={busy}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 sm:opacity-100 transition shadow disabled:opacity-30"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div
                    ref={galleryRef}
                    tabIndex={0}
                    className="aspect-[3/4] border-2 border-dashed border-brand-gold/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-brand-gold/5 text-brand-muted hover:text-brand-gold relative outline-none focus:ring-2 focus:ring-brand-gold/30 transition-colors"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-[9px] text-center px-1 leading-tight">Upload / Paste</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={onGalleryUpload}
                      disabled={busy}
                    />
                    {galleryUpload?.active && (
                      <UploadZoneOverlay
                        message={`Uploading ${galleryUpload.current} of ${galleryUpload.total}...`}
                        progress={{ current: galleryUpload.current, total: galleryUpload.total }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ProfileFormFields
              formData={formData}
              setFormData={setFormData}
              expandedSection={expandedSection}
              setExpandedSection={setExpandedSection}
              disabled={isSaving}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} disabled={busy} className="sw-btn-secondary px-5 py-2.5 text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="sw-btn-primary px-6 py-2.5 text-sm w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 min-w-[160px]"
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {saveLabel}
                </span>
              ) : (
                saveLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
