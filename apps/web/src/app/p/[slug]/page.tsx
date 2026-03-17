import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BlockRenderer } from '@/components/editor/BlockRenderer';
import type { PageSchema } from '@lp/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getPublishedPage(slug: string) {
  const res = await fetch(`${API_URL}/public/pages/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ title: string; schema: PageSchema }>;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPublishedPage(params.slug);
  if (!page) return { title: 'Not Found' };
  return {
    title: page.schema.meta.title || page.title,
    description: page.schema.meta.description,
    openGraph: page.schema.meta.ogImage ? { images: [page.schema.meta.ogImage] } : undefined,
    robots: page.schema.meta.noIndex ? { index: false } : undefined,
  };
}

export default async function PublishedPage({ params }: { params: { slug: string } }) {
  const page = await getPublishedPage(params.slug);
  if (!page) notFound();

  const blocks = [...page.schema.blocks]
    .filter((b) => b.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div style={{
      backgroundColor: page.schema.settings.backgroundColor,
      fontFamily: page.schema.settings.fontFamily,
    }}>
      <div style={{ maxWidth: page.schema.settings.maxWidth, margin: '0 auto' }}>
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} isPreview />
        ))}
      </div>
    </div>
  );
}
