'use client';

import { useEditorStore } from '@/store/editorStore';
import { BLOCK_META } from '@lp/shared';
import { Settings2 } from 'lucide-react';
import type { Block, BlockType } from '@lp/shared';

// Field editors per block type
import { HeroFields } from '../blocks/HeroFields';
import { FaqFields } from '../blocks/FaqFields';
import { QuestionnaireFields } from '../blocks/QuestionnaireFields';
import { FormFields } from '../blocks/FormFields';
import { TestimonialFields } from '../blocks/TestimonialFields';
import { CtaFields } from '../blocks/CtaFields';
import { CountdownFields } from '../blocks/CountdownFields';
import { TextImageFields } from '../blocks/TextImageFields';
import { ComplianceFields } from '../blocks/ComplianceFields';
import { StyleFields } from '../blocks/StyleFields';

export function BlockInspector() {
  const { schema, selectedBlockId, setSelectedBlock } = useEditorStore();

  if (!selectedBlockId) {
    return (
      <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
        <Settings2 className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">Select a block to edit its properties</p>
      </div>
    );
  }

  const block = schema?.blocks.find((b) => b.id === selectedBlockId);
  if (!block) return null;

  const meta = BLOCK_META[block.type as BlockType];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{meta.label}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
        </div>
        <button
          onClick={() => setSelectedBlock(null)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <BlockFieldEditor block={block} />
        <StyleFields block={block} />
      </div>
    </div>
  );
}

function BlockFieldEditor({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero': return <HeroFields block={block} />;
    case 'text_image': return <TextImageFields block={block} />;
    case 'faq': return <FaqFields block={block} />;
    case 'questionnaire': return <QuestionnaireFields block={block} />;
    case 'form': return <FormFields block={block} />;
    case 'testimonial': return <TestimonialFields block={block} />;
    case 'cta': return <CtaFields block={block} />;
    case 'countdown': return <CountdownFields block={block} />;
    case 'compliance': return <ComplianceFields block={block} />;
    default:
      return <p className="text-sm text-gray-400">No fields for this block type.</p>;
  }
}
