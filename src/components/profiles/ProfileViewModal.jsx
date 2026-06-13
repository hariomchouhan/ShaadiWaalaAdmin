import { Share2, X } from 'lucide-react';
import { PROFILE_SCHEMA } from '../../constants/profileSchema';
import { formatDate } from '../../utils/dateUtils';

const VIEW_SECTIONS = [
  ...new Set(
    PROFILE_SCHEMA.filter((f) => f.section !== 'Core').map((f) => f.section)
  ),
];

export default function ProfileViewModal({ profile, onClose, onPrint }) {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-brand-brown p-4 text-white flex justify-between items-center">
          <h2 className="font-bold text-xl">{profile.fullName}</h2>
          <div className="flex gap-3 items-center">
            <button onClick={onPrint} title="Print" className="hover:opacity-80 transition-opacity">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="hover:opacity-80 transition-opacity">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-brand-cream/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="aspect-[3/4] bg-brand-cream rounded-lg overflow-hidden mb-4 border border-brand-primary/10 shadow-sm">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>
              {profile.gallery && profile.gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {profile.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-brand-cream rounded overflow-hidden border border-brand-primary/10 shadow-sm"
                    >
                      <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-4">
              {VIEW_SECTIONS.map((section) => {
                const fields = PROFILE_SCHEMA.filter((f) => f.section === section);
                const hasData = fields.some((f) => profile[f.key]);
                if (!hasData) return null;

                return (
                  <div key={section} className="bg-white p-4 rounded shadow-sm border border-brand-primary/5">
                    <h3 className="font-bold text-brand-dark border-b border-brand-primary/10 pb-2 mb-3">
                      {section}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {fields.map((f) =>
                        profile[f.key] ? (
                          <div key={f.key}>
                            <span className="block text-xs text-gray-500">{f.label}</span>
                            <span className="text-brand-dark">
                              {f.type === 'date' ? formatDate(profile[f.key]) : profile[f.key]}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
