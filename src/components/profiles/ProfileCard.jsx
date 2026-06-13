import { Eye, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ProfileCard({ profile, onView, onEdit, onDelete }) {
  return (
    <div className="bg-brand-bg rounded-sm card-shadow overflow-hidden hover:border-brand-gold/30 transition-all border border-brand-gold/15 group">
      <div
        className="aspect-[3/4] bg-brand-surface relative cursor-pointer"
        onClick={() => onView(profile)}
      >
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="h-full flex items-center justify-center text-brand-gold/30">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-sm text-xs font-bold text-brand-gold border border-brand-gold/20">
          #{profile.refId}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-brand-text truncate">{profile.fullName}</h3>
        <p className="text-xs text-brand-muted truncate">{profile.community} · {profile.gender}</p>
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-brand-gold/10">
          <button onClick={() => onView(profile)} className="p-1.5 hover:bg-brand-surface rounded-sm text-brand-muted hover:text-brand-gold transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(profile)} className="p-1.5 hover:bg-brand-surface rounded-sm text-brand-brown hover:text-brand-gold transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
            className="p-1.5 hover:bg-red-50 rounded-sm text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
