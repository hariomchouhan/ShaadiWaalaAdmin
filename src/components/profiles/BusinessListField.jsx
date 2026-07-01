import { Plus, Trash2 } from 'lucide-react';

export default function BusinessListField({ businesses = [], onChange, disabled = false }) {
  const list = Array.isArray(businesses) ? businesses : [];

  const update = (index, patch) => {
    const next = list.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const add = () => {
    onChange([...list, { name: '', description: '' }]);
  };

  const remove = (index) => {
    onChange(list.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <p className="text-xs text-brand-muted">No businesses added yet.</p>
      )}

      {list.map((item, index) => (
        <div
          key={index}
          className="p-3 rounded-lg border border-brand-gold/15 bg-brand-surface/50 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              Business {index + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={disabled}
              className="p-1.5 rounded-md text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
              title="Remove business"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="sw-label">Name of Business</label>
            <input
              type="text"
              className="sw-input"
              value={item.name || ''}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Business name"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="sw-label">Description</label>
            <textarea
              className="sw-input resize-none"
              rows={2}
              value={item.description || ''}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="Brief description"
              disabled={disabled}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="sw-btn-secondary w-full py-2.5 text-sm disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Add Business
      </button>
    </div>
  );
}
