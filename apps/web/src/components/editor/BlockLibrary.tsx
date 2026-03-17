'use client';

import { useEditorStore } from '@/store/editorStore';
import { BLOCK_META, BLOCK_CATEGORIES } from '@lp/shared';
import type { BlockType } from '@lp/shared';
import {
  Sparkles, Image, HelpCircle, ListChecks, FileText,
  Quote, Zap, Clock, Table, ShieldCheck, Plus
} from 'lucide-react';
import { cn } from '@/lib/cn';

const ICONS: Record<string, React.ElementType> = {
  Sparkles, Image, HelpCircle, ListChecks, FileText,
  Quote, Zap, Clock, Table, ShieldCheck,
};

export function BlockLibrary() {
  const addBlock = useEditorStore((s) => s.addBlock);

  const byCategory = Object.entries(BLOCK_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    blocks: Object.entries(BLOCK_META)
      .filter(([, meta]) => meta.category === key)
      .map(([type, meta]) => ({ type: type as BlockType, ...meta })),
  })).filter((c) => c.blocks.length > 0);

  return (
    <div className="p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-1">
        Blocks
      </h2>
      {byCategory.map((category) => (
        <div key={category.key} className="mb-4">
          <p className="text-xs font-medium text-gray-400 mb-1.5 px-1">{category.label}</p>
          <div className="space-y-0.5">
            {category.blocks.map((block) => {
              const Icon = ICONS[block.icon] || Plus;
              return (
                <button
                  key={block.type}
                  onClick={() => addBlock(block.type)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2',
                    'text-left text-sm transition-colors',
                    'text-gray-700 hover:bg-brand-50 hover:text-brand-700 group'
                  )}
                  title={block.description}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 group-hover:bg-brand-100">
                    <Icon className="h-3.5 w-3.5 text-gray-600 group-hover:text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{block.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
