'use client';

import { useEditorStore } from '@/store/editorStore';
import type { TestimonialBlock, TestimonialItem } from '@lp/shared';
import { Field } from './HeroFields';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export function TestimonialFields({ block }: { block: TestimonialBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  function addItem() {
    u({ items: [...p.items, { id: uuid(), quote: 'This product is amazing!', authorName: 'Customer Name', rating: 5 }] });
  }

  function updateItem(id: string, patch: Partial<TestimonialItem>) {
    u({ items: p.items.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function removeItem(id: string) {
    u({ items: p.items.filter((t) => t.id !== id) });
  }

  return (
    <div className="space-y-4">
      <Field label="Section Heading">
        <input className="input" value={p.heading || ''} onChange={(e) => u({ heading: e.target.value })} />
      </Field>
      <Field label="Layout">
        <select className="input" value={p.layout || 'grid'} onChange={(e) => u({ layout: e.target.value as 'grid' | 'carousel' | 'list' })}>
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Testimonials ({p.items.length})</label>
          <button onClick={addItem} className="btn-secondary py-1 px-2 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {p.items.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">#{idx + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea className="input text-xs" rows={3} placeholder="Quote" value={item.quote} onChange={(e) => updateItem(item.id, { quote: e.target.value })} />
              <input className="input text-xs" placeholder="Author Name" value={item.authorName} onChange={(e) => updateItem(item.id, { authorName: e.target.value })} />
              <input className="input text-xs" placeholder="Title (optional)" value={item.authorTitle || ''} onChange={(e) => updateItem(item.id, { authorTitle: e.target.value })} />
              <div>
                <label className="text-xs text-gray-500">Rating</label>
                <select className="input text-xs mt-1" value={item.rating || 5} onChange={(e) => updateItem(item.id, { rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
