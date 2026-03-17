'use client';

import { useEditorStore } from '@/store/editorStore';
import type { Block } from '@lp/shared';
import { Field } from './HeroFields';

export function StyleFields({ block }: { block: Block }) {
  const updateBlockStyles = useEditorStore((s) => s.updateBlockStyles);
  const s = block.styles;
  const u = (patch: typeof s) => updateBlockStyles(block.id, patch);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Styles</h4>
      <Field label="Background Color">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={s.backgroundColor || '#ffffff'}
            onChange={(e) => u({ backgroundColor: e.target.value })}
            className="h-9 w-14 rounded border border-gray-300 cursor-pointer p-1"
          />
          <input
            className="input flex-1"
            placeholder="#ffffff"
            value={s.backgroundColor || ''}
            onChange={(e) => u({ backgroundColor: e.target.value })}
          />
        </div>
      </Field>
      <Field label="Text Color">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={s.textColor || '#111827'}
            onChange={(e) => u({ textColor: e.target.value })}
            className="h-9 w-14 rounded border border-gray-300 cursor-pointer p-1"
          />
          <input
            className="input flex-1"
            placeholder="#111827"
            value={s.textColor || ''}
            onChange={(e) => u({ textColor: e.target.value })}
          />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Padding Top">
          <input className="input" placeholder="e.g. 4rem" value={s.paddingTop || ''} onChange={(e) => u({ paddingTop: e.target.value })} />
        </Field>
        <Field label="Padding Bottom">
          <input className="input" placeholder="e.g. 4rem" value={s.paddingBottom || ''} onChange={(e) => u({ paddingBottom: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}
