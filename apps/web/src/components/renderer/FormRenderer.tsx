'use client';

import { useState } from 'react';
import type { FormBlock } from '@lp/shared';
import { CheckCircle } from 'lucide-react';

export function FormRenderer({ block, isPreview }: { block: FormBlock; isPreview?: boolean }) {
  const { props } = block;
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="py-16 px-6 text-center" style={{ backgroundColor: block.styles.backgroundColor }}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600">{props.successMessage || "We'll be in touch soon."}</p>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 md:px-12" style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className="mx-auto max-w-lg">
        {props.heading && <h2 className="text-3xl font-bold text-gray-900 mb-2">{props.heading}</h2>}
        {props.subheading && <p className="text-gray-500 mb-8">{props.subheading}</p>}

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          {props.fields.map((field) => (
            <div key={field.id}>
              <label className="label">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="input"
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                />
              ) : field.type === 'select' ? (
                <select
                  className="input"
                  required={field.required}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                >
                  <option value="">Select an option</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-brand-600"
                    checked={values[field.id] === 'true'}
                    onChange={(e) => setValues({ ...values, [field.id]: e.target.checked ? 'true' : 'false' })}
                  />
                  <span className="text-sm text-gray-700">{field.placeholder || field.label}</span>
                </label>
              ) : (
                <input
                  className="input"
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                />
              )}
            </div>
          ))}
          <button type="submit" className="btn-primary w-full py-3 text-base mt-2">
            {props.submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
