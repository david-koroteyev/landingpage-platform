'use client';

import { useEditorStore } from '@/store/editorStore';
import type { ComplianceBlock } from '@lp/shared';
import { Field } from './HeroFields';

export function ComplianceFields({ block }: { block: ComplianceBlock }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const u = (patch: Partial<typeof p>) => updateBlockProps(block.id, patch as Parameters<typeof updateBlockProps>[1]);

  return (
    <div className="space-y-4">
      <Field label="Disclaimer Text">
        <textarea className="input" rows={4} value={p.text} onChange={(e) => u({ text: e.target.value })} />
      </Field>
      <Field label="Display Style">
        <select className="input" value={p.variant || 'subtle'} onChange={(e) => u({ variant: e.target.value as 'subtle' | 'bordered' | 'prominent' })}>
          <option value="subtle">Subtle (small gray text)</option>
          <option value="bordered">Bordered</option>
          <option value="prominent">Prominent (warning box)</option>
        </select>
      </Field>
    </div>
  );
}
