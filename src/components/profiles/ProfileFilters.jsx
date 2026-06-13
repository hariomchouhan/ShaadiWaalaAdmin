import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function ProfileFilters({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) {
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="mb-6 space-y-4">
      <div className="sw-card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
            <input
              type="text"
              className="sw-input pl-10"
              placeholder="Search by name, phone, caste, ref ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            onClick={onToggleFilters}
            className={`sw-btn-secondary px-4 py-2.5 text-sm shrink-0 ${showFilters ? 'border-brand-gold text-brand-gold bg-brand-gold/5' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-gold ml-1" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-brand-gold/10 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="sw-label">Gender</label>
              <select
                className="sw-select"
                value={activeFilters.gender}
                onChange={(e) => onFilterChange({ ...activeFilters, gender: e.target.value })}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="sw-label">Min Age</label>
              <input
                type="number"
                placeholder="18"
                className="sw-input"
                value={activeFilters.minAge}
                onChange={(e) => onFilterChange({ ...activeFilters, minAge: e.target.value })}
              />
            </div>
            <div>
              <label className="sw-label">Max Age</label>
              <input
                type="number"
                placeholder="45"
                className="sw-input"
                value={activeFilters.maxAge}
                onChange={(e) => onFilterChange({ ...activeFilters, maxAge: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button onClick={onClearFilters} className="sw-btn-ghost w-full py-2.5 text-sm text-brand-gold">
                <X className="w-4 h-4" /> Clear filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
