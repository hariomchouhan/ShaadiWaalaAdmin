import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PROFILE_SCHEMA } from '../../constants/profileSchema';

export default function ProfileFormFields({
  formData,
  setFormData,
  expandedSection,
  setExpandedSection,
}) {
  let currentSection = null;

  return (
    <div className="flex flex-wrap -mx-2">
      {PROFILE_SCHEMA.filter((f) => f.section !== 'Core').map((field) => {
        const isNewSection = field.section !== currentSection;
        currentSection = field.section;

        return (
          <React.Fragment key={field.key}>
            {isNewSection && (
              <div className="w-full mt-4 mb-2 px-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === field.section ? null : field.section
                    )
                  }
                  className="flex items-center justify-between w-full bg-brand-cream p-2 rounded-lg text-sm font-bold text-brand-dark hover:bg-brand-primary/10 transition-colors"
                >
                  {field.section}
                  {expandedSection === field.section ? (
                    <ChevronUp className="w-4 h-4 text-brand-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-brand-primary" />
                  )}
                </button>
              </div>
            )}
            {expandedSection === field.section && (
              <div className={`px-2 mb-4 ${field.width || 'w-full'}`}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="sw-input text-sm focus:ring-brand-primary"
                    rows={3}
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                  />
                ) : field.type === 'select' ? (
                  <select
                    className="sw-input text-sm bg-white focus:ring-brand-primary"
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    className="sw-input text-sm focus:ring-brand-primary"
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    placeholder={field.placeholder || ''}
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
