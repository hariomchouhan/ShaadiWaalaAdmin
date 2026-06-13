import { Search, SlidersHorizontal } from 'lucide-react';

export default function ProfileFilters({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) {
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="sw-input pl-10 py-3"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={onToggleFilters}
          className="px-4 py-3 rounded-xl border bg-white flex items-center gap-2 hover:bg-brand-cream transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-xl border shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            className="p-2 border rounded-lg"
            value={activeFilters.gender}
            onChange={(e) => onFilterChange({ ...activeFilters, gender: e.target.value })}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="number"
            placeholder="Min Age"
            className="p-2 border rounded-lg"
            value={activeFilters.minAge}
            onChange={(e) => onFilterChange({ ...activeFilters, minAge: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max Age"
            className="p-2 border rounded-lg"
            value={activeFilters.maxAge}
            onChange={(e) => onFilterChange({ ...activeFilters, maxAge: e.target.value })}
          />
          <button onClick={onClearFilters} className="text-brand-primary font-medium">
            Clear All
          </button>
        </div>
      )}
    </>
  );
}
