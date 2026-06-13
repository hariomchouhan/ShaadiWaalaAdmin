import { Search, SlidersHorizontal } from 'lucide-react';
import { hasActiveMemberFilters, getMemberFilterSummary } from '../../utils/memberFilters';

export default function ProfileFilters({
  searchTerm,
  onSearchChange,
  onOpenFilters,
  appliedMemberFilters,
}) {
  const filtersActive = hasActiveMemberFilters(appliedMemberFilters);
  const summary = getMemberFilterSummary(appliedMemberFilters);

  return (
    <div className="mb-6 space-y-3">
      <div className="sw-card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
            <input
              type="text"
              className="sw-input pl-10"
              placeholder="Quick search — name, weight, city, phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={onOpenFilters}
            className={`sw-btn-secondary px-4 py-2.5 text-sm shrink-0 ${filtersActive ? 'border-brand-gold text-brand-gold bg-brand-gold/5' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {filtersActive ? 'Edit Filters' : 'Filters'}
            {filtersActive && <span className="w-2 h-2 rounded-full bg-brand-gold ml-0.5" />}
          </button>
        </div>
      </div>

      {filtersActive && summary && (
        <div className="sw-card px-4 py-2.5 flex flex-wrap items-center gap-2 text-sm">
          <span className="sw-badge">{summary}</span>
          <button type="button" onClick={onOpenFilters} className="text-xs text-brand-gold hover:underline ml-auto">
            Change filters
          </button>
        </div>
      )}
    </div>
  );
}
