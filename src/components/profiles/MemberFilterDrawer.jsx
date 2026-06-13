import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  RELIGIONS, MARITAL_STATUS, COMPLEXION, HEIGHTS, WEIGHTS, DIET, PLANS,
  STATES_INDIA, OCCUPATIONS, EDUCATION_LEVELS,
} from '../../constants/options';
import { DEFAULT_MEMBER_FILTERS } from '../../utils/memberFilters';

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-brand-gold/10 pb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-brand-muted" /> : <ChevronDown className="w-4 h-4 text-brand-muted" />}
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  );
}

function CheckboxGroup({ options, selected, onChange, columns = 2 }) {
  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : ''} gap-2 max-h-40 overflow-y-auto scrollbar-thin pr-1`}>
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 rounded accent-brand-gold shrink-0"
          />
          <span className="leading-tight">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map(({ label, val }) => (
        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer text-brand-text">
          <input
            type="radio"
            name={name}
            checked={value === val}
            onChange={() => onChange(val)}
            className="accent-brand-gold"
          />
          {label}
        </label>
      ))}
    </div>
  );
}

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
          <FilterSection title="Basic Search">
            <div>
              <label className="sw-label">Name or Member ID</label>
              <input
                className="sw-input"
                value={draft.nameOrRefId}
                onChange={(e) => update({ nameOrRefId: e.target.value })}
                placeholder="Search by name or ref ID"
              />
            </div>
            <div>
              <label className="sw-label">Father&apos;s or Mother&apos;s Name</label>
              <input
                className="sw-input"
                value={draft.parentName}
                onChange={(e) => update({ parentName: e.target.value })}
                placeholder="Parent name"
              />
            </div>
            <div>
              <label className="sw-label">Father&apos;s or Mother&apos;s Number</label>
              <input
                className="sw-input"
                value={draft.parentPhone}
                onChange={(e) => update({ parentPhone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </FilterSection>

          <FilterSection title="Looking For">
            <RadioGroup
              name="lookingFor"
              value={draft.lookingFor}
              onChange={(val) => update({ lookingFor: val })}
              options={[
                { label: 'All', val: '' },
                { label: 'Bride (Female)', val: 'Female' },
                { label: 'Groom (Male)', val: 'Male' },
              ]}
            />
          </FilterSection>

          <FilterSection title="Location & NRI">
            <div>
              <label className="sw-label">State</label>
              <select className="sw-select" value={draft.state} onChange={(e) => update({ state: e.target.value })}>
                <option value="">All States</option>
                {STATES_INDIA.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="sw-label">NRI</label>
              <RadioGroup
                name="nri"
                value={draft.nri}
                onChange={(val) => update({ nri: val })}
                options={[
                  { label: 'All', val: '' },
                  { label: 'No', val: 'No' },
                  { label: 'Yes', val: 'Yes' },
                ]}
              />
            </div>
          </FilterSection>

          <FilterSection title="Marital Status">
            <CheckboxGroup
              options={MARITAL_STATUS}
              selected={draft.maritalStatus}
              onChange={(maritalStatus) => update({ maritalStatus })}
            />
          </FilterSection>

          <FilterSection title="Age">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sw-label">From</label>
                <select className="sw-select" value={draft.minAge} onChange={(e) => update({ minAge: e.target.value })}>
                  <option value="">Any</option>
                  {Array.from({ length: 48 }, (_, i) => i + 18).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="sw-label">To</label>
                <select className="sw-select" value={draft.maxAge} onChange={(e) => update({ maxAge: e.target.value })}>
                  <option value="">Any</option>
                  {Array.from({ length: 48 }, (_, i) => i + 18).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Height" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sw-label">From</label>
                <select className="sw-select" value={draft.minHeight} onChange={(e) => update({ minHeight: e.target.value })}>
                  <option value="">Any</option>
                  {HEIGHTS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="sw-label">To</label>
                <select className="sw-select" value={draft.maxHeight} onChange={(e) => update({ maxHeight: e.target.value })}>
                  <option value="">Any</option>
                  {HEIGHTS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Weight" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sw-label">From (kg)</label>
                <select className="sw-select" value={draft.minWeight} onChange={(e) => update({ minWeight: e.target.value })}>
                  <option value="">Any</option>
                  {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="sw-label">To (kg)</label>
                <select className="sw-select" value={draft.maxWeight} onChange={(e) => update({ maxWeight: e.target.value })}>
                  <option value="">Any</option>
                  {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Complexion" defaultOpen={false}>
            <CheckboxGroup options={COMPLEXION} selected={draft.complexion} onChange={(complexion) => update({ complexion })} />
          </FilterSection>

          <FilterSection title="Eating Habit" defaultOpen={false}>
            <CheckboxGroup options={DIET} selected={draft.eating} onChange={(eating) => update({ eating })} />
          </FilterSection>

          <FilterSection title="Plans" defaultOpen={false}>
            <CheckboxGroup options={PLANS} selected={draft.plans} onChange={(plans) => update({ plans })} />
          </FilterSection>

          <FilterSection title="Education" defaultOpen={false}>
            <CheckboxGroup
              options={EDUCATION_LEVELS}
              selected={draft.education}
              onChange={(education) => update({ education })}
              columns={1}
            />
          </FilterSection>

          <FilterSection title="Profession / Employed In" defaultOpen={false}>
            <CheckboxGroup
              options={OCCUPATIONS}
              selected={draft.occupation}
              onChange={(occupation) => update({ occupation })}
              columns={1}
            />
          </FilterSection>

          <FilterSection title="Religion" defaultOpen={false}>
            <RadioGroup
              name="religion"
              value={draft.religion}
              onChange={(val) => update({ religion: val })}
              options={[{ label: 'All', val: '' }, ...RELIGIONS.map((r) => ({ label: r, val: r }))]}
            />
          </FilterSection>
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
