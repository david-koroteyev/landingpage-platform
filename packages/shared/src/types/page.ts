import type { Block } from './block';

export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

export interface PageSettings {
  backgroundColor: string;
  fontFamily: string;
  maxWidth: string; // e.g. '1200px'
  primaryColor: string;
  secondaryColor: string;
  customCss?: string;
}

export interface PageSchema {
  schemaVersion: 1;
  blocks: Block[];
  settings: PageSettings;
  meta: PageMeta;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  schema: PageSchema;
  authorId: string;
  brandId?: string | null;
  campaign?: string | null;
  tags: string[];
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  schema: PageSchema;
  message?: string | null;
  authorId: string;
  createdAt: string;
}

export interface PublishRecord {
  id: string;
  pageId: string;
  publishedBy: string;
  version: number;
  url: string;
  isActive: boolean;
  createdAt: string;
}
