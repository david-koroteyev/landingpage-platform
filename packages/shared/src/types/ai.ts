import type { BlockType, BlockPropsMap, BlockStyles } from './block';
import type { PageSettings, PageMeta } from './page';

// Every operation the AI is allowed to emit. No raw HTML or JSX — only structured mutations.

export interface AddBlockOperation {
  type: 'add_block';
  blockType: BlockType;
  afterBlockId?: string | null; // null means append to end
  props: Partial<BlockPropsMap[BlockType]>;
  styles?: Partial<BlockStyles>;
}

export interface DeleteBlockOperation {
  type: 'delete_block';
  blockId: string;
}

export interface MoveBlockOperation {
  type: 'move_block';
  blockId: string;
  afterBlockId?: string | null; // null means move to top
}

export interface UpdateBlockContentOperation {
  type: 'update_block_content';
  blockId: string;
  props: Partial<BlockPropsMap[BlockType]>;
}

export interface UpdateBlockStyleOperation {
  type: 'update_block_style';
  blockId: string;
  styles: Partial<BlockStyles>;
}

export interface UpdatePageSettingsOperation {
  type: 'update_page_settings';
  settings: Partial<PageSettings>;
}

export interface UpdatePageMetaOperation {
  type: 'update_page_meta';
  meta: Partial<PageMeta>;
}

export type AiOperation =
  | AddBlockOperation
  | DeleteBlockOperation
  | MoveBlockOperation
  | UpdateBlockContentOperation
  | UpdateBlockStyleOperation
  | UpdatePageSettingsOperation
  | UpdatePageMetaOperation;

export interface AiPromptRequest {
  prompt: string;
  pageId: string;
  // We send the current schema so the AI has context
  currentSchema: import('./page').PageSchema;
}

export interface AiPromptResponse {
  operations: AiOperation[];
  explanation: string; // Human-readable summary of what the AI will do
  promptLogId: string;
}
