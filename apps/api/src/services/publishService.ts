import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PageSchema } from '@lp/shared';

export async function publishPage(pageId: string, publishedBy: string, slugOverride?: string) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      versions: { orderBy: { version: 'desc' }, take: 1 },
    },
  });

  if (!page) throw new AppError(404, 'Page not found');
  if (page.status === 'ARCHIVED') throw new AppError(400, 'Cannot publish an archived page');

  const slug = slugOverride || page.slug;
  const url = `${env.PUBLIC_BASE_URL}/p/${slug}`;

  // Deactivate previous publish records for this page
  await prisma.publishRecord.updateMany({
    where: { pageId, isActive: true },
    data: { isActive: false },
  });

  const currentVersion = page.versions[0]?.version ?? 1;

  const record = await prisma.publishRecord.create({
    data: {
      pageId,
      publishedBy,
      version: currentVersion,
      url,
      schema: page.schema as object,
      isActive: true,
    },
  });

  await prisma.page.update({
    where: { id: pageId },
    data: { status: 'PUBLISHED', slug },
  });

  return { url, publishRecordId: record.id, version: currentVersion };
}

export async function unpublishPage(pageId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) throw new AppError(404, 'Page not found');
  if (page.status !== 'PUBLISHED') throw new AppError(400, 'Page is not published');

  await prisma.publishRecord.updateMany({
    where: { pageId, isActive: true },
    data: { isActive: false },
  });

  await prisma.page.update({
    where: { id: pageId },
    data: { status: 'DRAFT' },
  });
}

export async function getPublishedPageBySlug(slug: string) {
  const page = await prisma.page.findUnique({
    where: { slug, status: 'PUBLISHED' },
  });

  if (!page) return null;

  return {
    title: page.title,
    schema: page.schema as unknown as PageSchema,
  };
}

export async function rollbackToPublishRecord(pageId: string, recordId: string, userId: string) {
  const record = await prisma.publishRecord.findFirst({ where: { id: recordId, pageId } });
  if (!record) throw new AppError(404, 'Publish record not found');

  await prisma.page.update({
    where: { id: pageId },
    data: { schema: record.schema as object },
  });

  return prisma.publishRecord.findFirst({ where: { pageId, isActive: true } });
}
