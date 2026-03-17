import * as cheerio from 'cheerio';
import { v4 as uuid } from 'uuid';
import type { PageSchema, Block } from '@lp/shared';
import { prisma } from '../config/prisma.js';
import { generateUniqueSlug } from '../utils/slugify.js';

// NOTE: This import feature is provided for authorized internal use only.
// Users acknowledge they should only import pages they are authorized to copy.

interface ImportResult {
  pageId: string;
  title: string;
  blockCount: number;
  warnings: string[];
}

export async function importFromUrl(
  url: string,
  requestedBy: string,
  pageTitle?: string
): Promise<ImportResult> {
  const jobId = (
    await prisma.importJob.create({
      data: { url, requestedBy, status: 'running' },
    })
  ).id;

  try {
    const html = await fetchUrl(url);
    const { title, blocks, warnings } = parseHtmlToBlocks(html, url);

    const finalTitle = pageTitle || title || 'Imported Page';
    const slug = await generateUniqueSlug(finalTitle);

    const schema: PageSchema = {
      schemaVersion: 1,
      blocks,
      settings: {
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '1200px',
        primaryColor: '#3b82f6',
        secondaryColor: '#6366f1',
      },
      meta: { title: finalTitle },
    };

    const page = await prisma.page.create({
      data: {
        title: finalTitle,
        slug,
        status: 'DRAFT',
        schema: schema as object,
        authorId: requestedBy,
        campaign: `Imported from ${new URL(url).hostname}`,
        tags: ['imported'],
      },
    });

    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'completed', resultPageId: page.id },
    });

    return { pageId: page.id, title: finalTitle, blockCount: blocks.length, warnings };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'failed', error: message },
    });
    throw err;
  }
}

async function fetchUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LPPlatformImporter/1.0)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    throw new Error('URL did not return HTML content');
  }

  return response.text();
}

interface ParseResult {
  title: string;
  blocks: Block[];
  warnings: string[];
}

function parseHtmlToBlocks(html: string, sourceUrl: string): ParseResult {
  const $ = cheerio.load(html);
  const warnings: string[] = [];
  const blocks: Block[] = [];
  let order = 0;

  const title = $('title').first().text().trim() ||
    $('h1').first().text().trim() ||
    'Imported Page';

  // Remove scripts, styles, nav, footer, headers for cleaner extraction
  $('script, style, noscript, nav, footer, header, [aria-hidden="true"]').remove();

  // Heuristic: find the main content area
  const mainSelectors = ['main', '[role="main"]', '#main', '#content', '.main-content', 'article', 'body'];
  let $main = $('body');
  for (const sel of mainSelectors) {
    if ($(sel).length) { $main = $(sel); break; }
  }

  // Extract hero: first large heading + paragraph + possible button
  const $firstH1 = $main.find('h1').first();
  if ($firstH1.length) {
    const headline = $firstH1.text().trim();
    const $nextP = $firstH1.next('p, h2, h3');
    const subheadline = $nextP.is('p') ? $nextP.first().text().trim() : undefined;

    // Look for a CTA button near the hero
    const $btn = $firstH1.parent().find('a[href], button').first();
    const ctaLabel = $btn.length ? $btn.text().trim().slice(0, 100) : undefined;
    const ctaHref = $btn.attr('href') || undefined;

    // Look for a background image
    const bgStyle = $firstH1.parent().attr('style') || '';
    const bgMatch = bgStyle.match(/background(?:-image)?\s*:[^;]*url\(['"]?([^'")\s]+)['"]?\)/i);
    const backgroundImage = bgMatch ? resolveUrl(bgMatch[1], sourceUrl) : undefined;

    blocks.push({
      id: uuid(),
      type: 'hero',
      order: order++,
      locked: false,
      visible: true,
      styles: {},
      props: { headline, subheadline, ctaLabel, ctaHref, backgroundImage, alignment: 'center' },
    });
  }

  // Extract FAQ-like sections: dt/dd pairs or heading+p patterns that look like Q&A
  const faqItems: Array<{ id: string; question: string; answer: string }> = [];
  $main.find('dt').each((_, el) => {
    const question = $(el).text().trim();
    const answer = $(el).next('dd').text().trim();
    if (question && answer) faqItems.push({ id: uuid(), question, answer });
  });

  if (faqItems.length >= 2) {
    blocks.push({
      id: uuid(),
      type: 'faq',
      order: order++,
      locked: false,
      visible: true,
      styles: {},
      props: { heading: 'FAQ', items: faqItems.slice(0, 20) },
    });
  }

  // Extract testimonials: blockquote elements
  const testimonialItems: Array<{ id: string; quote: string; authorName: string }> = [];
  $main.find('blockquote').each((_, el) => {
    const quote = $(el).find('p').first().text().trim() || $(el).text().trim();
    const cite = $(el).find('cite, footer, .author, .name').first().text().trim();
    if (quote.length > 10) {
      testimonialItems.push({ id: uuid(), quote: quote.slice(0, 500), authorName: cite || 'Customer' });
    }
  });

  if (testimonialItems.length > 0) {
    blocks.push({
      id: uuid(),
      type: 'testimonial',
      order: order++,
      locked: false,
      visible: true,
      styles: {},
      props: { heading: 'What People Are Saying', layout: 'grid', items: testimonialItems.slice(0, 6) },
    });
  }

  // Extract content sections: each major h2 block becomes a text_image block
  $main.find('h2').each((_, el) => {
    const heading = $(el).text().trim();
    if (!heading || heading.length < 3) return;

    // Collect paragraphs following this heading until the next h2
    const bodyParts: string[] = [];
    let $next = $(el).next();
    while ($next.length && !$next.is('h1,h2,h3')) {
      if ($next.is('p')) bodyParts.push($next.text().trim());
      $next = $next.next();
    }
    const body = bodyParts.join('\n\n').slice(0, 2000);
    if (!body) return;

    // Check for nearby image
    const $img = $(el).parent().find('img').first();
    const imageUrl = $img.length ? resolveUrl($img.attr('src') || '', sourceUrl) : undefined;
    const imageAlt = $img.attr('alt') || undefined;

    blocks.push({
      id: uuid(),
      type: 'text_image',
      order: order++,
      locked: false,
      visible: true,
      styles: {},
      props: { heading, body, imageUrl, imageAlt, imagePosition: order % 2 === 0 ? 'right' : 'left' },
    });
  });

  // Check for forms
  const $forms = $main.find('form');
  if ($forms.length > 0) {
    const fields: Array<{ id: string; type: string; label: string; required: boolean }> = [];
    $forms.first().find('input, textarea, select').each((_, el) => {
      const type = $(el).attr('type') || (el.name === 'textarea' ? 'textarea' : 'text');
      if (['submit', 'button', 'hidden', 'reset'].includes(type)) return;
      const id = $(el).attr('name') || uuid();
      const labelEl = $forms.first().find(`label[for="${$(el).attr('id')}"]`);
      const label = labelEl.text().trim() || $(el).attr('placeholder') || id;
      fields.push({ id, type: type === 'email' ? 'email' : type === 'textarea' ? 'textarea' : 'text', label, required: $(el).is('[required]') });
    });

    if (fields.length > 0) {
      blocks.push({
        id: uuid(),
        type: 'form',
        order: order++,
        locked: false,
        visible: true,
        styles: {},
        props: { heading: 'Get in Touch', fields, submitLabel: 'Submit' },
      });
    }
  }

  if (blocks.length === 0) {
    warnings.push('Could not extract meaningful content from this URL. A blank page was created.');
    blocks.push({
      id: uuid(),
      type: 'hero',
      order: 0,
      locked: false,
      visible: true,
      styles: {},
      props: { headline: title, alignment: 'center' },
    });
  } else {
    warnings.push('Imported content is an approximation. Please review and edit each block.');
  }

  return { title, blocks, warnings };
}

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}
