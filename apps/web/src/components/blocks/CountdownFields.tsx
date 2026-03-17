'use client';

import { useEditorStore } from '@/store/editorStore';
import type { CountdownBlock } from '@lp/shared';
import { Field } from './HeroFields';

export function CountdownFields({ block }: { block: CountdownBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  // Format datetime-local value from ISO string
  const localValue = p.targetDate
    ? new Date(p.targetDate).toISOString().slice(0, 16)
    : '';

  return (
    <div className="space-y-4">
      <Field label="Heading"><input className="input" value={p.heading || ''} onChange={(e) => u({ heading: e.target.value })} /></Field>
      <Field label="Target Date & Time">
        <input
          className="input"
          type="datetime-local"
          value={localValue}
          onChange={(e) => u({ targetDate: new Date(e.target.value).toISOString() })}
        />
      </Field>
      <Field label="Expired Message"><input className="input" value={p.expiredMessage || ''} onChange={(e) => u({ expiredMessage: e.target.value })} /></Field>
      <Field label="CTA Button"><input className="input" placeholder="Claim Offer" value={p.ctaLabel || ''} onChange={(e) => u({ ctaLabel: e.target.value })} /></Field>
      <Field label="CTA URL"><input className="input" placeholder="#" value={p.ctaHref || ''} onChange={(e) => u({ ctaHref: e.target.value })} /></Field>
    </div>
  );
}
