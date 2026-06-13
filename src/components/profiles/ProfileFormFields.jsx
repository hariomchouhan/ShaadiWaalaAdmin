import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PROFILE_SCHEMA } from '../../constants/profileSchema';

export default function ProfileFormFields({
  formData,
  setFormData,
  expandedSection,
  setExpandedSection,
  disabled = false,
}) {
  let currentSection = null;

  return (
    <div className="flex flex-wrap -mx-2">
      {PROFILE_SCHEMA.filter((f) => f.section !== 'Core').map((field) => {
        const isNewSection = field.section !== currentSection;
        currentSection = field.section;
        const isOpen = expandedSection === field.section;

        return (
          <React.Fragment key={field.key}>
            {isNewSection && (
              <div className="w-full mt-3 mb-1 px-2">
                <button
                  type="button"
                  onClick={() => setExpandedSection(isOpen ? null : field.section)}
                  disabled={disabled}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                    isOpen
                      ? 'bg-brand-gold/10 text-brand-brown border-brand-gold/30'
                      : 'bg-brand-surface text-brand-text border-brand-gold/10 hover:border-brand-gold/25'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-brand-gold' : 'bg-brand-gold/40'}`} />
                    {field.section}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-brand-gold" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-brand-muted" />
                  )}
                </button>
              </div>
            )}
            {isOpen && (
              <div className={`px-2 mb-3 w-full`}>
                <label className="sw-label">
                  {field.label}
                  {field.required && <span className="text-red-500 normal-case"> *</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="sw-input resize-none"
                    rows={3}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    disabled={disabled}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className="sw-select"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    required={field.required}
                    disabled={disabled}
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    className="sw-input"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder || ''}
                    disabled={disabled}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
