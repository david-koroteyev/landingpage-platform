'use client';

import { useEditorStore } from '@/store/editorStore';
import type { FaqBlock, FaqItem } from '@lp/shared';
import { Field } from './HeroFields';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export function FaqFields({ block }: { block: FaqBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  function updateItem(id: string, patch: Partial<FaqItem>) {
    u({ items: p.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  }

  function addItem() {
    u({ items: [...p.items, { id: uuid(), question: 'New question?', answer: 'Your answer here.' }] });
  }

  function removeItem(id: string) {
    u({ items: p.items.filter((i) => i.id !== id) });
  }

  return (
    <div className="space-y-4">
      <Field label="Section Heading">
        <input className="input" value={p.heading || ''} onChange={(e) => u({ heading: e.target.value })} />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Questions ({p.items.length})</label>
          <button onClick={addItem} className="btn-secondary py-1 px-2 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {p.items.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Q{idx + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                className="input text-xs"
                placeholder="Question"
                value={item.question}
                onChange={(e) => updateItem(item.id, { question: e.target.value })}
              />
              <textarea
                className="input text-xs"
                placeholder="Answer"
                rows={2}
                value={item.answer}
                onChange={(e) => updateItem(item.id, { answer: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
