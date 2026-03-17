'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useEditorStore } from '@/store/editorStore';
import { BlockItem } from './BlockItem';
import { BLOCK_META } from '@lp/shared';
import { Plus } from 'lucide-react';

export function EditorCanvas() {
  const { schema, reorderBlocks, addBlock, selectedBlockId } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!schema) return null;

  const blocks = [...schema.blocks].sort((a, b) => a.order - b.order);
  const blockIds = blocks.map((b) => b.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blockIds.indexOf(String(active.id));
    const newIndex = blockIds.indexOf(String(over.id));
    const newOrder = arrayMove(blockIds, oldIndex, newIndex);
    reorderBlocks(newOrder);
  }

  return (
    <div className="min-h-full py-8 px-4">
      <div
        className="mx-auto"
        style={{ maxWidth: schema.settings.maxWidth }}
      >
        <div
          className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white"
          style={{ backgroundColor: schema.settings.backgroundColor }}
        >
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-lg font-semibold text-gray-900">Your page is empty</h3>
              <p className="text-gray-500 mt-1 max-w-sm text-sm">
                Add blocks from the left panel, or ask the AI assistant to build your page.
              </p>
              <button
                className="btn-primary mt-4 gap-1.5"
                onClick={() => addBlock('hero')}
              >
                <Plus className="h-4 w-4" /> Add Hero Section
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
