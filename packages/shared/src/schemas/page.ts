import { z } from 'zod';
import { blockSchema } from './block';

export const pageMetaSchema = z.object({
  title: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
  noIndex: z.boolean().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
});

export const pageSettingsSchema = z.object({
  backgroundColor: z.string().max(50).default('#ffffff'),
  fontFamily: z.string().max(200).default('Inter, sans-serif'),
  maxWidth: z.string().max(20).default('1200px'),
  primaryColor: z.string().max(50).default('#3b82f6'),
  secondaryColor: z.string().max(50).default('#6366f1'),
  customCss: z.string().max(50000).optional(),
});

export const pageSchemaSchema = z.object({
  schemaVersion: z.literal(1),
  blocks: z.array(blockSchema).max(200),
  settings: pageSettingsSchema,
  meta: pageMetaSchema,
});

export const createPageSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens').max(200).optional(),
  brandId: z.string().cuid().optional(),
  campaign: z.string().max(200).optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  fromTemplateId: z.string().cuid().optional(),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200).optional(),
  schema: pageSchemaSchema.optional(),
  campaign: z.string().max(200).optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  versionMessage: z.string().max(500).optional(),
});

export const publishPageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200).optional(),
  meta: pageMetaSchema.optional(),
});

export const importUrlSchema = z.object({
  url: z.string().url(),
  title: z.string().max(300).optional(),
});
