import { X } from 'lucide-react';
import MemberFilterFields from '../filters/MemberFilterFields';
import { DEFAULT_MEMBER_FILTERS } from '../../utils/memberFilters';

export default function MemberFilterDrawer({ open, draft, setDraft, onApply, onClose, onClear }) {
  if (!open) return null;

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <div className="drawer-overlay no-print" onClick={onClose}>
      <aside className="drawer-panel max-w-[min(100%,480px)]" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3 className="font-display text-lg font-bold text-brand-text">Search Filters</h3>
            <p className="text-xs text-brand-muted mt-0.5">Find members by detailed criteria</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onClear} className="text-xs font-medium text-brand-gold hover:underline px-2">
              Clear
            </button>
            <button type="button" onClick={onClose} className="p-2 sw-btn-ghost rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="drawer-body scrollbar-thin space-y-4">
          <MemberFilterFields draft={draft} onUpdate={update} />
        </div>

        <div className="drawer-footer">
          <button type="button" onClick={onClose} className="sw-btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
          <button type="button" onClick={onApply} className="sw-btn-primary flex-1 py-2.5 text-sm">Search</button>
        </div>
      </aside>
    </div>
  );
}

export { DEFAULT_MEMBER_FILTERS };
