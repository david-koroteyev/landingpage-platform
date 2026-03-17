import { prisma } from '../config/prisma.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { parsePagination } from '../utils/paginate.js';
import type { PageSchema } from '@lp/shared';
import { AppError } from '../middleware/errorHandler.js';
import type { PageStatus } from '@prisma/client';

const DEFAULT_SCHEMA: PageSchema = {
  schemaVersion: 1,
  blocks: [],
  settings: {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    maxWidth: '1200px',
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
  },
  meta: {},
};

export async function listPages(
  userId: string,
  userRole: string,
  query: Record<string, unknown>
) {
  const { skip, take, page, limit } = parsePagination(query);

  const where: Record<string, unknown> = {};

  // Non-admins can only see their own pages plus published pages
  if (userRole === 'VIEWER') {
    where.status = 'PUBLISHED';
  }

  if (query.status) where.status = String(query.status).toUpperCase() as PageStatus;
  if (query.campaign) where.campaign = { contains: String(query.campaign), mode: 'insensitive' };
  if (query.brandId) where.brandId = String(query.brandId);
  if (query.authorId) where.authorId = String(query.authorId);
  if (query.search) {
    where.OR = [
      { title: { contains: String(query.search), mode: 'insensitive' } },
      { campaign: { contains: String(query.search), mode: 'insensitive' } },
    ];
  }
  // Exclude archived by default unless explicitly requested
  if (!query.status) {
    where.status = { not: 'ARCHIVED' };
  }

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        campaign: true,
        tags: true,
        authorId: true,
        brandId: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.page.count({ where }),
  ]);

  return { pages, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPage(id: string) {
  const page = await prisma.page.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

export async function createPage(
  data: { title: string; slug?: string; brandId?: string; campaign?: string; tags?: string[]; fromTemplateId?: string },
  authorId: string
) {
  const slug = data.slug || (await generateUniqueSlug(data.title));

  let schema: PageSchema = DEFAULT_SCHEMA;
  if (data.fromTemplateId) {
    const template = await prisma.template.findUnique({ where: { id: data.fromTemplateId } });
    if (template) schema = template.schema as unknown as PageSchema;
  }

  schema = { ...schema, meta: { ...schema.meta, title: data.title } };

  const page = await prisma.page.create({
    data: {
      title: data.title,
      slug,
      status: 'DRAFT',
      schema: schema as object,
      authorId,
      brandId: data.brandId ?? null,
      campaign: data.campaign ?? null,
      tags: data.tags ?? [],
    },
  });

  // Create initial version
  await createVersion(page.id, schema, authorId, 'Initial version');

  return page;
}

export async function updatePage(
  id: string,
  data: { title?: string; slug?: string; schema?: PageSchema; campaign?: string; tags?: string[]; versionMessage?: string },
  authorId: string
) {
  const existing = await getPage(id);

  if (data.slug && data.slug !== existing.slug) {
    const conflict = await prisma.page.findUnique({ where: { slug: data.slug } });
    if (conflict && conflict.id !== id) {
      throw new AppError(409, 'Slug already in use');
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.schema !== undefined) updateData.schema = data.schema as object;
  if (data.campaign !== undefined) updateData.campaign = data.campaign;
  if (data.tags !== undefined) updateData.tags = data.tags;

  const page = await prisma.page.update({ where: { id }, data: updateData });

  // Snapshot a new version whenever schema changes
  if (data.schema) {
    await createVersion(id, data.schema, authorId, data.versionMessage);
    // Keep only last 50 versions
    await pruneVersions(id);
  }

  return page;
}

export async function duplicatePage(id: string, authorId: string) {
  const original = await getPage(id);
  const newTitle = `${original.title} (Copy)`;
  const slug = await generateUniqueSlug(newTitle);

  const copy = await prisma.page.create({
    data: {
      title: newTitle,
      slug,
      status: 'DRAFT',
      schema: original.schema as object,
      authorId,
      brandId: original.brandId,
      campaign: original.campaign,
      tags: original.tags,
    },
  });

  await createVersion(copy.id, original.schema as unknown as PageSchema, authorId, 'Duplicated');
  return copy;
}

export async function archivePage(id: string) {
  return prisma.page.update({
    where: { id },
    data: { status: 'ARCHIVED', archivedAt: new Date() },
  });
}

export async function listVersions(pageId: string) {
  return prisma.pageVersion.findMany({
    where: { pageId },
    orderBy: { version: 'desc' },
    take: 50,
    select: {
      id: true,
      version: true,
      message: true,
      authorId: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function restoreVersion(pageId: string, versionId: string, authorId: string) {
  const version = await prisma.pageVersion.findFirst({
    where: { id: versionId, pageId },
  });
  if (!version) throw new AppError(404, 'Version not found');

  return updatePage(pageId, {
    schema: version.schema as unknown as PageSchema,
    versionMessage: `Restored to version ${version.version}`,
  }, authorId);
}

// --- Internal helpers ---

async function createVersion(pageId: string, schema: PageSchema, authorId: string, message?: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    try {
      return await prisma.pageVersion.create({
        data: {
          pageId,
          version: nextVersion,
          schema: schema as object,
          message: message ?? null,
          authorId,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002' && attempt < 4) continue;
      throw err;
    }
  }
}

async function pruneVersions(pageId: string) {
  const versions = await prisma.pageVersion.findMany({
    where: { pageId },
    orderBy: { version: 'desc' },
    select: { id: true },
  });
  if (versions.length > 50) {
    const toDelete = versions.slice(50).map((v) => v.id);
    await prisma.pageVersion.deleteMany({ where: { id: { in: toDelete } } });
  }
}
