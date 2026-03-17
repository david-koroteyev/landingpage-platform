'use client';

import { useEditorStore } from '@/store/editorStore';
import type { HeroBlock } from '@lp/shared';

export function HeroFields({ block }: { block: HeroBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Content</h4>
      <Field label="Headline">
        <textarea className="input" rows={2} value={p.headline} onChange={(e) => u({ headline: e.target.value })} />
      </Field>
      <Field label="Subheadline">
        <textarea className="input" rows={3} value={p.subheadline || ''} onChange={(e) => u({ subheadline: e.target.value })} />
      </Field>
      <Field label="CTA Button Label">
        <input className="input" value={p.ctaLabel || ''} onChange={(e) => u({ ctaLabel: e.target.value })} />
      </Field>
      <Field label="CTA Button URL">
        <input className="input" placeholder="#" value={p.ctaHref || ''} onChange={(e) => u({ ctaHref: e.target.value })} />
      </Field>
      <Field label="Alignment">
        <select className="input" value={p.alignment || 'center'} onChange={(e) => u({ alignment: e.target.value as 'left' | 'center' | 'right' })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </Field>
      <Field label="Background Image URL">
        <input className="input" placeholder="https://..." value={p.backgroundImage || ''} onChange={(e) => u({ backgroundImage: e.target.value })} />
      </Field>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
