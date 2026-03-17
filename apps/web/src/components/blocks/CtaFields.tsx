'use client';

import { useEditorStore } from '@/store/editorStore';
import type { CtaBlock } from '@lp/shared';
import { Field } from './HeroFields';

export function CtaFields({ block }: { block: CtaBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  return (
    <div className="space-y-4">
      <Field label="Heading"><input className="input" value={p.heading} onChange={(e) => u({ heading: e.target.value })} /></Field>
      <Field label="Subheading"><textarea className="input" rows={2} value={p.subheading || ''} onChange={(e) => u({ subheading: e.target.value })} /></Field>
      <Field label="Primary Button"><input className="input" value={p.primaryLabel} onChange={(e) => u({ primaryLabel: e.target.value })} /></Field>
      <Field label="Primary URL"><input className="input" value={p.primaryHref} onChange={(e) => u({ primaryHref: e.target.value })} /></Field>
      <Field label="Style">
        <select className="input" value={p.backgroundStyle || 'branded'} onChange={(e) => u({ backgroundStyle: e.target.value as 'default' | 'branded' | 'dark' })}>
          <option value="branded">Branded (blue)</option>
          <option value="dark">Dark</option>
          <option value="default">Light</option>
        </select>
      </Field>
    </div>
  );
}
