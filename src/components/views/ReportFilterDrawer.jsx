import { X } from 'lucide-react';
import MemberFilterFields, { FilterSection } from '../filters/MemberFilterFields';

export default function ReportFilterDrawer({ open, draft, setDraft, onApply, onClose, onClear }) {
  if (!open) return null;

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleApply = () => {
    if (!draft.isMasterList && (!draft.startYear || !draft.endYear)) {
      return;
    }
    onApply();
  };

  const canApply = draft.isMasterList || (draft.startYear && draft.endYear);

  return (
    <div className="drawer-overlay no-print" onClick={onClose}>
      <aside className="drawer-panel max-w-[min(100%,480px)]" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3 className="font-display text-lg font-bold text-brand-text">Report Filters</h3>
            <p className="text-xs text-brand-muted mt-0.5">Member criteria + list options</p>
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
          <MemberFilterFields
            draft={draft}
            onUpdate={(patch) => update(patch)}
            hideNri
          />

          <FilterSection title="Report Options" defaultOpen>
            <div>
              <label className="sw-label">List Type</label>
              <select
                className="sw-select font-medium text-brand-brown"
                value={draft.nriFilter}
                onChange={(e) => update({ nriFilter: e.target.value })}
              >
                <option value="No">Indian</option>
                <option value="Yes">NRI Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sw-label">From Year</label>
                <input
                  type="number"
                  disabled={draft.isMasterList}
                  className={`sw-input ${draft.isMasterList ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={draft.startYear}
                  onChange={(e) => update({ startYear: e.target.value })}
                  placeholder="1990"
                />
              </div>
              <div>
                <label className="sw-label">To Year</label>
                <input
                  type="number"
                  disabled={draft.isMasterList}
                  className={`sw-input ${draft.isMasterList ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={draft.endYear}
                  onChange={(e) => update({ endYear: e.target.value })}
                  placeholder="1995"
                />
              </div>
            </div>

            {!draft.isMasterList && (
              <label className="flex items-center gap-2.5 text-sm cursor-pointer text-brand-text">
                <input
                  type="checkbox"
                  checked={draft.exclusiveRange}
                  onChange={(e) => update({ exclusiveRange: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-gold"
                />
                <span>Exclusive range (include From, exclude To year)</span>
              </label>
            )}

            <div>
              <label className="sw-label">Print Layout</label>
              <div className="flex bg-brand-surface border border-brand-gold/20 rounded-lg p-1">
                {['portrait', 'landscape'].map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => update({ printLayout: layout })}
                    className={`flex-1 px-3 py-2.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                      draft.printLayout === layout
                        ? 'bg-brand-gold text-white shadow-sm'
                        : 'text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-brand-gold/10">
              <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-brand-text">
                <input
                  type="checkbox"
                  checked={draft.isMasterList}
                  onChange={(e) => update({ isMasterList: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-gold"
                />
                <span className="font-semibold">Master List</span>
              </label>

              <label className={`flex items-center gap-2.5 text-sm ${draft.isMasterList ? 'cursor-pointer text-brand-text' : 'opacity-40 cursor-not-allowed'}`}>
                <input
                  type="checkbox"
                  disabled={!draft.isMasterList}
                  checked={draft.splitGender}
                  onChange={(e) => update({ splitGender: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-gold"
                />
                <span>Separate Boys / Girls</span>
              </label>
            </div>

            <div className={`space-y-3 pt-2 border-t border-brand-gold/10 ${draft.isMasterList ? 'opacity-40' : ''}`}>
              <label className={`flex items-center gap-2.5 text-sm font-medium ${draft.isMasterList ? 'cursor-not-allowed' : 'cursor-pointer text-brand-text'}`}>
                <input
                  type="checkbox"
                  disabled={draft.isMasterList}
                  checked={draft.showBlankRows}
                  onChange={(e) => update({ showBlankRows: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-gold"
                />
                <span className="font-semibold">Blank Notes Rows</span>
              </label>

              <div>
                <label className="sw-label">Lines per caste group</label>
                <input
                  type="number"
                  disabled={draft.isMasterList || !draft.showBlankRows}
                  value={draft.blankRowCount}
                  onChange={(e) => update({ blankRowCount: e.target.value })}
                  className={`sw-input w-24 ${(!draft.showBlankRows || draft.isMasterList) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        <div className="drawer-footer">
          <button type="button" onClick={onClose} className="sw-btn-secondary flex-1 py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="sw-btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </div>
  );
}
