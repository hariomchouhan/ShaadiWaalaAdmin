import { Camera, Plus, X } from 'lucide-react';
import ProfileFormFields from './ProfileFormFields';

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
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <h3 className="font-bold text-xl mb-6 text-brand-dark">
          {currentProfile ? 'Edit' : 'New'} Profile
        </h3>
        <form onSubmit={onSubmit}>
          <div className="flex gap-6 mb-6 items-start border-b border-brand-primary/10 pb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-brand-cream rounded-full overflow-hidden flex-shrink-0 cursor-pointer border-2 border-dashed border-brand-primary/30 outline-none focus-within:ring-2 focus-within:ring-brand-primary relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                  onChange={onManualUpload}
                />
                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-500">Main Photo</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Extra Photos</label>
              <div className="grid grid-cols-4 gap-3">
                {formData.gallery?.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] bg-brand-cream rounded overflow-hidden group border border-brand-primary/10"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <div
                  ref={galleryRef}
                  tabIndex={0}
                  className="aspect-[3/4] border-2 border-dashed border-brand-primary/30 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-brand-cream text-gray-400 hover:text-brand-primary relative outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] text-center px-1">
                    Click to Upload
                    <br />
                    or Paste Here
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onGalleryUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          <ProfileFormFields
            formData={formData}
            setFormData={setFormData}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
          />

          <div className="flex justify-end gap-3 mt-6 border-t border-brand-primary/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="sw-btn-primary px-6 py-2">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
