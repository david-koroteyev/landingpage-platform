'use client';

import { useEditorStore } from '@/store/editorStore';
import type { FormBlock, FormField } from '@lp/shared';
import { Field } from './HeroFields';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export function FormFields({ block }: { block: FormBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  function addField() {
    u({ fields: [...p.fields, { id: uuid(), type: 'text', label: 'New Field', required: false }] });
  }

  function updateField(id: string, patch: Partial<FormField>) {
    u({ fields: p.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  }

  function removeField(id: string) {
    u({ fields: p.fields.filter((f) => f.id !== id) });
  }

  return (
    <div className="space-y-4">
      <Field label="Form Heading">
        <input className="input" value={p.heading || ''} onChange={(e) => u({ heading: e.target.value })} />
      </Field>
      <Field label="Submit Button Label">
        <input className="input" value={p.submitLabel} onChange={(e) => u({ submitLabel: e.target.value })} />
      </Field>
      <Field label="Success Message">
        <input className="input" value={p.successMessage || ''} onChange={(e) => u({ successMessage: e.target.value })} />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Fields ({p.fields.length})</label>
          <button onClick={addField} className="btn-secondary py-1 px-2 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {p.fields.map((field, idx) => (
            <div key={field.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Field {idx + 1}</span>
                <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input className="input text-xs" placeholder="Label" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} />
              <select className="input text-xs" value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select dropdown</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <input className="input text-xs" placeholder="Placeholder" value={field.placeholder || ''} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} />
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} className="rounded" />
                Required
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
