import { Eye, Edit2, Trash2, User } from 'lucide-react';
import { getAge } from '../../utils/dateUtils';

export default function ProfileCard({ profile, onView, onEdit, onDelete }) {
  const age = getAge(profile.dob);

  return (
    <article className="sw-card group overflow-hidden hover:border-brand-gold/30 hover:shadow-gold/10 transition-all duration-300">
      <div className="relative">
        <div
          className="aspect-[3/4] bg-brand-surface relative cursor-pointer overflow-hidden"
          onClick={() => onView(profile)}
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-brand-gold/25 gap-2">
              <User className="w-16 h-16" strokeWidth={1} />
              <span className="text-xs text-brand-muted">No photo</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute top-3 left-3 sw-badge">#{profile.refId}</div>
        {profile.gender && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-bg/90 text-brand-brown border border-brand-gold/20">
            {profile.gender}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-brand-text truncate text-base">{profile.fullName || 'Unnamed'}</h3>
        <p className="text-xs text-brand-muted mt-0.5 truncate">
          {[profile.community, age, profile.location].filter(Boolean).join(' · ') || '—'}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-gold/10">
          {profile.planName ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">{profile.planName}</span>
          ) : <span />}
          <div className="flex gap-1">
            <button onClick={() => onView(profile)} className="p-2 sw-btn-ghost" title="View">
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
