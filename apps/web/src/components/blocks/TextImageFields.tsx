'use client';

import { useEditorStore } from '@/store/editorStore';
import type { TextImageBlock } from '@lp/shared';
import { Field } from './HeroFields';

export function TextImageFields({ block }: { block: TextImageBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  return (
    <div className="space-y-4">
      <Field label="Heading"><input className="input" value={p.heading || ''} onChange={(e) => u({ heading: e.target.value })} /></Field>
      <Field label="Body Text"><textarea className="input" rows={5} value={p.body} onChange={(e) => u({ body: e.target.value })} /></Field>
      <Field label="Image URL"><input className="input" placeholder="https://..." value={p.imageUrl || ''} onChange={(e) => u({ imageUrl: e.target.value })} /></Field>
      <Field label="Image Alt Text"><input className="input" value={p.imageAlt || ''} onChange={(e) => u({ imageAlt: e.target.value })} /></Field>
      <Field label="Image Position">
        <select className="input" value={p.imagePosition || 'right'} onChange={(e) => u({ imagePosition: e.target.value as 'left' | 'right' })}>
          <option value="right">Right</option>
          <option value="left">Left</option>
        </select>
      </Field>
      <Field label="CTA Label"><input className="input" value={p.ctaLabel || ''} onChange={(e) => u({ ctaLabel: e.target.value })} /></Field>
      <Field label="CTA URL"><input className="input" value={p.ctaHref || ''} onChange={(e) => u({ ctaHref: e.target.value })} /></Field>
    </div>
  );
}
