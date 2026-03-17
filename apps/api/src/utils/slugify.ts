import { prisma } from '../config/prisma.js';

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

export async function generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = toSlug(base);
  let candidate = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await prisma.page.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    attempt++;
    candidate = `${baseSlug}-${attempt}`;
  }
}
