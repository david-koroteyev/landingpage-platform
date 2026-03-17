import { z } from 'zod';

// Validates the JSON operations the AI is allowed to emit
const addBlockOperationSchema = z.object({
  type: z.literal('add_block'),
  blockType: z.enum([
    'hero', 'text_image', 'faq', 'questionnaire', 'form',
    'testimonial', 'cta', 'countdown', 'comparison_table', 'compliance',
  ]),
  afterBlockId: z.string().nullable().optional(),
  props: z.record(z.unknown()),
  styles: z.record(z.string()).optional(),
});

const deleteBlockOperationSchema = z.object({
  type: z.literal('delete_block'),
  blockId: z.string(),
});

const moveBlockOperationSchema = z.object({
  type: z.literal('move_block'),
  blockId: z.string(),
  afterBlockId: z.string().nullable().optional(),
});

const updateBlockContentOperationSchema = z.object({
  type: z.literal('update_block_content'),
  blockId: z.string(),
  props: z.record(z.unknown()),
});

const updateBlockStyleOperationSchema = z.object({
  type: z.literal('update_block_style'),
  blockId: z.string(),
  styles: z.record(z.string()),
});

const updatePageSettingsOperationSchema = z.object({
  type: z.literal('update_page_settings'),
  settings: z.record(z.string()),
});

const updatePageMetaOperationSchema = z.object({
  type: z.literal('update_page_meta'),
  meta: z.record(z.unknown()),
});

export const aiOperationSchema = z.discriminatedUnion('type', [
  addBlockOperationSchema,
  deleteBlockOperationSchema,
  moveBlockOperationSchema,
  updateBlockContentOperationSchema,
  updateBlockStyleOperationSchema,
  updatePageSettingsOperationSchema,
  updatePageMetaOperationSchema,
]);

export const aiOperationsResponseSchema = z.object({
  operations: z.array(aiOperationSchema).max(20),
  explanation: z.string().max(1000),
});

export const aiPromptRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  pageId: z.string().cuid(),
  currentSchema: z.unknown(), // validated separately
});
