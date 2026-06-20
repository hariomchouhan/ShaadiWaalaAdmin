import { Eye, Edit2, Trash2, User } from 'lucide-react';
import { getAge } from '../../utils/dateUtils';

export default function ProfileCard({ profile, onView, onEdit, onDelete }) {
  const age = getAge(profile.dob);
  const isFemale = profile.gender === 'Female';

  return (
    <article className="profile-card group">
      <div className="p-3 pb-0">
        <div
          className="profile-card-photo relative cursor-pointer overflow-hidden"
          onClick={() => onView(profile)}
        >
          {profile.avatar ? (
            <>
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="profile-card-photo-overlay" aria-hidden="true" />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 profile-card-placeholder">
              <div className="w-[72px] h-[72px] rounded-full bg-brand-gold/20 border-2 border-brand-gold/35 flex items-center justify-center shadow-inner">
                <User className="w-9 h-9 text-brand-gold-dark" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-semibold text-brand-brown/75 uppercase tracking-[0.14em]">
                No Photo
              </span>
            </div>
          )}

          {profile.refId && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-gold text-white shadow-sm border border-brand-gold-dark/30">
              #{profile.refId}
            </div>
          )}
          {profile.gender && (
            <div
              className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                isFemale
                  ? 'bg-brand-gold/95 text-white border-brand-gold-dark/40'
                  : 'bg-brand-brown text-white border-brand-brown/60'
              }`}
            >
              {profile.gender}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-3">
        <h3 className="font-display font-bold text-brand-brown truncate text-base leading-snug">
          {profile.fullName || 'Unnamed'}
        </h3>
        <p className="text-xs text-brand-muted mt-1 truncate leading-relaxed">
          {[profile.community, age, profile.location].filter(Boolean).join(' · ') || '—'}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-gold/15">
          {profile.planName ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gold-dark bg-brand-gold/10 px-2 py-0.5 rounded">
              {profile.planName}
            </span>
          ) : (
            <span className="text-[10px] text-brand-muted/50">—</span>
          )}
          <div className="flex gap-0.5">
            <button onClick={() => onView(profile)} className="p-2 sw-btn-ghost text-brand-brown" title="View">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => onEdit(profile)} className="p-2 sw-btn-ghost text-brand-brown" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
              className="p-2 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
