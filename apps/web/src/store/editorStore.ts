import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Block, BlockType, BlockPropsMap, BlockStyles, PageSchema } from '@lp/shared';
import { BLOCK_META } from '@lp/shared';

interface EditorState {
  pageId: string | null;
  pageTitle: string;
  pageSlug: string;
  schema: PageSchema | null;
  selectedBlockId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  history: PageSchema[]; // for undo
  historyIndex: number;

  // Setters
  initEditor: (pageId: string, title: string, slug: string, schema: PageSchema) => void;
  setSelectedBlock: (blockId: string | null) => void;
  setIsSaving: (val: boolean) => void;
  setSaveError: (err: string | null) => void;
  setPageTitle: (title: string) => void;
  setPageSlug: (slug: string) => void;

  // Block mutations
  addBlock: (blockType: BlockType, afterBlockId?: string | null, props?: Partial<BlockPropsMap[BlockType]>) => string;
  updateBlockProps: (blockId: string, props: Partial<BlockPropsMap[BlockType]>) => void;
  updateBlockStyles: (blockId: string, styles: Partial<BlockStyles>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, afterBlockId: string | null) => void;
  reorderBlocks: (orderedIds: string[]) => void;
  toggleBlockVisibility: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;

  // Page-level
  updatePageSettings: (settings: Partial<PageSchema['settings']>) => void;
  updatePageMeta: (meta: Partial<PageSchema['meta']>) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Apply AI operations (called after validating server response)
  applyAiOperations: (operations: import('@lp/shared').AiOperation[]) => void;
}

const MAX_HISTORY = 30;

export const useEditorStore = create<EditorState>((set, get) => ({
  pageId: null,
  pageTitle: '',
  pageSlug: '',
  schema: null,
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  saveError: null,
  history: [],
  historyIndex: -1,

  initEditor(pageId, title, slug, schema) {
    set({
      pageId,
      pageTitle: title,
      pageSlug: slug,
      schema,
      selectedBlockId: null,
      isDirty: false,
      history: [schema],
      historyIndex: 0,
    });
  },

  setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
  setIsSaving: (val) => set({ isSaving: val }),
  setSaveError: (err) => set({ saveError: err }),
  setPageTitle: (title) => set({ pageTitle: title, isDirty: true }),
  setPageSlug: (slug) => set({ pageSlug: slug, isDirty: true }),

  addBlock(blockType, afterBlockId, customProps) {
    const schema = get().schema!;
    const id = uuid();
    const meta = BLOCK_META[blockType];
    const defaultProps = meta.defaultProps as BlockPropsMap[typeof blockType];

    const newBlock: Block = {
      id,
      type: blockType,
      order: 0, // recalculated below
      locked: false,
      visible: true,
      styles: {},
      props: { ...defaultProps, ...customProps },
    } as unknown as Block;

    let blocks = [...schema.blocks];

    if (afterBlockId === null || afterBlockId === undefined) {
      blocks.push(newBlock);
    } else {
      const idx = blocks.findIndex((b) => b.id === afterBlockId);
      if (idx === -1) {
        blocks.push(newBlock);
      } else {
        blocks.splice(idx + 1, 0, newBlock);
      }
    }

    blocks = blocks.map((b, i) => ({ ...b, order: i }));
    pushHistory(get, set, { ...schema, blocks });
    set({ selectedBlockId: id });
    return id;
  },

  updateBlockProps(blockId, props) {
    const schema = get().schema!;
    const blocks = schema.blocks.map((b) =>
      b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b
    );
    pushHistory(get, set, { ...schema, blocks });
  },

  updateBlockStyles(blockId, styles) {
    const schema = get().schema!;
    const blocks = schema.blocks.map((b) =>
      b.id === blockId ? { ...b, styles: { ...b.styles, ...styles } } : b
    );
    pushHistory(get, set, { ...schema, blocks });
  },

  deleteBlock(blockId) {
    const schema = get().schema!;
    const block = schema.blocks.find((b) => b.id === blockId);
    if (block?.locked) return; // cannot delete locked blocks
    const blocks = schema.blocks
      .filter((b) => b.id !== blockId)
      .map((b, i) => ({ ...b, order: i }));
    pushHistory(get, set, { ...schema, blocks });
    if (get().selectedBlockId === blockId) set({ selectedBlockId: null });
  },

  moveBlock(blockId, afterBlockId) {
    const schema = get().schema!;
    let blocks = schema.blocks.filter((b) => b.id !== blockId);
    const moving = schema.blocks.find((b) => b.id === blockId)!;

    if (afterBlockId === null) {
      blocks = [moving, ...blocks];
    } else {
      const idx = blocks.findIndex((b) => b.id === afterBlockId);
      blocks.splice(idx + 1, 0, moving);
    }

    blocks = blocks.map((b, i) => ({ ...b, order: i }));
    pushHistory(get, set, { ...schema, blocks });
  },

  reorderBlocks(orderedIds) {
    const schema = get().schema!;
    const blockMap = new Map(schema.blocks.map((b) => [b.id, b]));
    const blocks = orderedIds
      .map((id, i) => ({ ...blockMap.get(id)!, order: i }))
      .filter(Boolean);
    pushHistory(get, set, { ...schema, blocks });
  },

  toggleBlockVisibility(blockId) {
    const schema = get().schema!;
    const blocks = schema.blocks.map((b) =>
      b.id === blockId ? { ...b, visible: !b.visible } : b
    );
    pushHistory(get, set, { ...schema, blocks });
  },

  duplicateBlock(blockId) {
    const schema = get().schema!;
    const original = schema.blocks.find((b) => b.id === blockId);
    if (!original) return;
    const copy = { ...original, id: uuid(), locked: false };
    const idx = schema.blocks.findIndex((b) => b.id === blockId);
    const blocks = [...schema.blocks];
    blocks.splice(idx + 1, 0, copy);
    pushHistory(get, set, { ...schema, blocks: blocks.map((b, i) => ({ ...b, order: i })) });
  },

  updatePageSettings(settings) {
    const schema = get().schema!;
    pushHistory(get, set, { ...schema, settings: { ...schema.settings, ...settings } });
  },

  updatePageMeta(meta) {
    const schema = get().schema!;
    pushHistory(get, set, { ...schema, meta: { ...schema.meta, ...meta } });
  },

  undo() {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ schema: history[newIndex], historyIndex: newIndex, isDirty: true });
  },

  redo() {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ schema: history[newIndex], historyIndex: newIndex, isDirty: true });
  },

  applyAiOperations(operations) {
    for (const op of operations) {
      const state = get();
      switch (op.type) {
        case 'add_block':
          state.addBlock(op.blockType as BlockType, op.afterBlockId ?? null, op.props as Partial<BlockPropsMap[BlockType]>);
          break;
        case 'delete_block':
          state.deleteBlock(op.blockId);
          break;
        case 'move_block':
          state.moveBlock(op.blockId, op.afterBlockId ?? null);
          break;
        case 'update_block_content':
          state.updateBlockProps(op.blockId, op.props as Partial<BlockPropsMap[BlockType]>);
          break;
        case 'update_block_style':
          state.updateBlockStyles(op.blockId, op.styles as Partial<BlockStyles>);
          break;
        case 'update_page_settings':
          state.updatePageSettings(op.settings as Partial<PageSchema['settings']>);
          break;
        case 'update_page_meta':
          state.updatePageMeta(op.meta as Partial<PageSchema['meta']>);
          break;
      }
    }
  },
}));

function pushHistory(
  get: () => EditorState,
  set: (partial: Partial<EditorState>) => void,
  schema: PageSchema
) {
  const { history, historyIndex } = get();
  // Truncate forward history on new action
  const newHistory = [...history.slice(0, historyIndex + 1), schema].slice(-MAX_HISTORY);
  set({ schema, history: newHistory, historyIndex: newHistory.length - 1, isDirty: true });
}
