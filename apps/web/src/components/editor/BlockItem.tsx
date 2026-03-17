'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/store/editorStore';
import { BlockRenderer } from './BlockRenderer';
import type { Block } from '@lp/shared';
import { cn } from '@/lib/cn';
import { GripVertical, Trash2, Copy, EyeOff, Eye, Lock } from 'lucide-react';

interface BlockItemProps {
  block: Block;
  isSelected: boolean;
}

export function BlockItem({ block, isSelected }: BlockItemProps) {
  const { setSelectedBlock, deleteBlock, duplicateBlock, toggleBlockVisibility } = useEditorStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: block.locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50',
        !block.visible && 'opacity-40',
        isSelected && 'ring-2 ring-inset ring-brand-500',
      )}
      onClick={() => setSelectedBlock(block.id)}
    >
      {/* Block toolbar (shown on hover/select) */}
      <div className={cn(
        'absolute top-0 left-0 right-0 z-10 flex items-center justify-between',
        'h-8 px-2 bg-brand-600 text-white text-xs',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        isSelected && 'opacity-100',
      )}>
        <div className="flex items-center gap-1">
          {!block.locked && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded"
              title="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          )}
          {block.locked && (
            <span className="flex items-center gap-1 px-1 py-0.5 rounded bg-white/20">
              <Lock className="h-3 w-3" /> Locked
            </span>
          )}
          <span className="font-medium capitalize">{block.type.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); toggleBlockVisibility(block.id); }}
            className="p-1 hover:bg-white/20 rounded"
            title={block.visible ? 'Hide' : 'Show'}
          >
            {block.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
            className="p-1 hover:bg-white/20 rounded"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {!block.locked && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
              className="p-1 hover:bg-red-500/80 rounded"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* The actual block content */}
      <div className={cn(isSelected && 'pointer-events-none')}>
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}
