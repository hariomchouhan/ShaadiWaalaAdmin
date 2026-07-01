import { Printer, X, MapPin, Phone } from 'lucide-react';
import { PROFILE_SCHEMA, isProfileFieldVisible } from '../../constants/profileSchema';
import { formatDate, getAge } from '../../utils/dateUtils';
import { normalizeBusinesses } from '../../utils/businessUtils';

const VIEW_SECTIONS = [
  ...new Set(PROFILE_SCHEMA.filter((f) => f.section !== 'Core').map((f) => f.section)),
];

export default function ProfileViewModal({ profile, onClose, onPrint }) {
  if (!profile) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel sm:max-w-4xl h-[95vh] sm:h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header bg-brand-brown text-white border-brand-gold/20">
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold truncate">{profile.fullName}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-white/70 text-xs">
              {profile.refId && <span className="sw-badge bg-white/10 text-brand-gold border-brand-gold/30">#{profile.refId}</span>}
              {profile.community && <span>{profile.community}</span>}
              {profile.dob && <span>{getAge(profile.dob)}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onPrint} title="Print Biodata" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="modal-body bg-brand-surface/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div className="sw-card overflow-hidden">
                <div className="aspect-[3/4] bg-brand-surface">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-brand-gold/30 text-sm">No photo</div>
                  )}
                </div>
                {(profile.phone || profile.location) && (
                  <div className="p-4 space-y-2 border-t border-brand-gold/10">
                    {profile.phone && (
                      <p className="flex items-center gap-2 text-sm text-brand-text">
                        <Phone className="w-4 h-4 text-brand-gold shrink-0" /> {profile.phone}
                      </p>
                    )}
                    {profile.location && (
                      <p className="flex items-center gap-2 text-sm text-brand-muted">
                        <MapPin className="w-4 h-4 text-brand-gold shrink-0" /> {profile.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {profile.gallery?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {profile.gallery.map((img, i) => (
                    <div key={i} className="aspect-[3/4] sw-card overflow-hidden p-0">
                      <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-4">
              {VIEW_SECTIONS.map((section) => {
                const fields = PROFILE_SCHEMA.filter((f) => f.section === section && f.type !== 'businesses');
                const visible = fields.filter((f) => isProfileFieldVisible(f, profile) && profile[f.key]);
                const businesses = section === 'Education & Career' ? normalizeBusinesses(profile.businesses) : [];
                if (visible.length === 0 && businesses.length === 0) return null;

                return (
                  <div key={section} className="sw-card p-4 sm:p-5">
                    <h3 className="font-display font-bold text-brand-text text-base mb-4 pb-2 border-b border-brand-gold/15 flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-gold rounded-full" />
                      {section}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {visible.map((f) => (
                        <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                          <span className="sw-label">{f.label}</span>
                          <p className={`text-sm text-brand-text font-medium break-words ${f.type === 'textarea' ? 'whitespace-pre-wrap' : ''}`}>
                            {f.type === 'date' ? formatDate(profile[f.key]) : profile[f.key]}
                          </p>
                        </div>
                      ))}
                    </div>
                    {businesses.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg bg-brand-surface/60 border border-brand-gold/15">
                        <span className="sw-label text-brand-gold">Businesses</span>
                        <div className="space-y-4 mt-3">
                          {businesses.map((b, i) => (
                            <div key={i} className={i > 0 ? 'pt-4 border-t border-dashed border-brand-gold/20' : ''}>
                              {b.name && (
                                <p className="text-sm font-semibold text-brand-brown">{b.name}</p>
                              )}
                              {b.description && (
                                <p className="text-xs text-brand-muted mt-1 whitespace-pre-wrap leading-relaxed">{b.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
