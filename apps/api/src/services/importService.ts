import Anthropic from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';
import { v4 as uuid } from 'uuid';
import type { PageSchema, Block } from '@lp/shared';
import { BLOCK_META } from '@lp/shared';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { scrapeWithPlaywright } from './playwrightScraper.js';

// NOTE: This import feature is provided for authorized internal use only.
// Users acknowledge they should only import pages they are authorized to copy.

const VISION_MODEL = 'claude-sonnet-4-6';

const client = env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'mock'
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

// ─── Public API ────────────────────────────────────────────────────────────────

export interface StartImportResult {
  jobId: string;
}

/**
 * Creates an ImportJob record and kicks off the import in the background.
 * Returns immediately so the HTTP response can be sent as 202.
 */
export async function startImportJob(
  url: string,
  requestedBy: string,
  pageTitle?: string
): Promise<StartImportResult> {
  const job = await prisma.importJob.create({
    data: { url, requestedBy, status: 'pending' },
  });

  // Fire-and-forget — errors are caught and persisted to the job record
  runImportJob(job.id, url, requestedBy, pageTitle).catch((err) => {
    console.error(`[import] Unhandled failure for job ${job.id}:`, err);
  });

  return { jobId: job.id };
}

// ─── Job runner ────────────────────────────────────────────────────────────────

async function runImportJob(
  jobId: string,
  url: string,
  requestedBy: string,
  pageTitle?: string
): Promise<void> {
  const setStep = (step: string) =>
    prisma.importJob.update({ where: { id: jobId }, data: { status: 'running', step } });

  try {
    // ── Layer 1: Playwright scraping ───────────────────────────────────────
    await setStep('launching_browser');

    let scraped: Awaited<ReturnType<typeof scrapeWithPlaywright>> | null = null;
    let html = '';

    try {
      scraped = await scrapeWithPlaywright(url);
      html = scraped.html;
    } catch (playwrightErr) {
      // Playwright failed (bot-block, missing browser binaries, etc.)
      // Fall back to a plain fetch so the job can still make progress
      console.warn(`[import] Playwright failed for ${url}, falling back to fetch:`, playwrightErr);
      html = await fetchHtmlFallback(url);
    }

    await setStep('capturing_screenshot');
    // (screenshot was already captured above in the Playwright step;
    //  this step label is kept for UI continuity when Playwright succeeds)

    // ── Layer 2: AI reconstruction ─────────────────────────────────────────
    await setStep('analyzing_with_ai');

    let schema: PageSchema;

    if (client && scraped) {
      schema = await reconstructWithVision(scraped, url);
    } else if (client && !scraped) {
      // No screenshot — still use AI but text-only
      schema = await reconstructWithHtml(html, url);
    } else {
      // No API key — fall back to heuristic cheerio parsing
      const result = parseHtmlToBlocks(html, url);
      schema = buildSchema(result.blocks, result.title);
    }

    // ── Layer 3: Persist page ──────────────────────────────────────────────
    await setStep('building_page');

    const finalTitle = pageTitle || schema.meta.title || 'Imported Page';
    const slug = await generateUniqueSlug(finalTitle);

    schema.meta.title = finalTitle;

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
      data: {
        status: 'completed',
        step: null,
        resultPageId: page.id,
        screenshot: scraped?.screenshot ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'failed', step: null, error: message },
    });
  }
}

// ─── Vision AI reconstruction ──────────────────────────────────────────────────

const BLOCK_TYPE_DOCS = Object.entries(BLOCK_META)
  .map(([type, meta]) => `- **${type}**: ${meta.description}`)
  .join('\n');

const VISION_SYSTEM_PROMPT = `You are a landing page reconstruction AI. Given a screenshot and HTML source of a landing page, reconstruct it as a structured JSON schema using the available block types below. Your goal is maximum fidelity to the original.

## Available block types
${BLOCK_TYPE_DOCS}

## Output schema
Return ONLY a single valid JSON object — no markdown, no prose — with this exact structure:
{
  "schemaVersion": 1,
  "settings": {
    "backgroundColor": "<hex or rgb>",
    "fontFamily": "<primary font, fallbacks>",
    "maxWidth": "1200px",
    "primaryColor": "<hex>",
    "secondaryColor": "<hex>"
  },
  "meta": {
    "title": "<page title>",
    "description": "<meta description if visible>"
  },
  "blocks": [
    {
      "id": "<short unique id like b1, b2, ...>",
      "type": "<block type>",
      "order": <integer starting at 0>,
      "locked": false,
      "visible": true,
      "styles": {
        "backgroundColor": "<override if section has distinct bg>",
        "paddingTop": "<e.g. 80px>",
        "paddingBottom": "<e.g. 80px>"
      },
      "props": { <block-specific props — see below> }
    }
  ]
}

## Block prop shapes

**hero**: { headline, subheadline?, ctaLabel?, ctaHref?, secondaryLabel?, secondaryHref?, backgroundImage?, alignment: "left"|"center"|"right" }

**text_image**: { heading, body, imageUrl?, imageAlt?, imagePosition: "left"|"right", ctaLabel?, ctaHref? }

**testimonial**: { heading?, layout: "grid"|"carousel", items: [{ id, quote, authorName, authorTitle?, authorCompany?, rating? }] }

**faq**: { heading?, items: [{ id, question, answer }] }

**cta**: { heading, subheading?, primaryLabel, primaryHref?, secondaryLabel?, secondaryHref?, backgroundStyle: "branded"|"dark"|"light" }

**form**: { heading?, fields: [{ id, type: "text"|"email"|"textarea"|"phone"|"select", label, placeholder?, required }], submitLabel }

**countdown**: { heading?, targetDate: "<ISO 8601>", showDays, showHours, showMinutes, showSeconds, ctaLabel?, ctaHref? }

**comparison_table**: { heading?, columns: [{ id, label, isHighlighted? }], rows: [{ id, feature, values: { <colId>: true|false|string } }] }

**compliance**: { text, variant: "subtle"|"box"|"banner" }

**questionnaire**: { heading?, submitLabel?, questions: [{ id, type: "single_choice"|"multiple_choice"|"text", text, required, options?: [{ id, label, value }] }] }

## Rules
- Use the screenshot as the primary source; HTML is supplementary
- Extract real text content (headlines, body copy, button labels, testimonials, FAQ items, etc.)
- Map page sections to block types based on visual layout and purpose
- Colors and fonts should come from what you see in the screenshot
- Keep IDs short: b1, b2, etc.
- Always include at least a hero block
- Return ONLY the JSON object`;

async function reconstructWithVision(
  scraped: Awaited<ReturnType<typeof scrapeWithPlaywright>>,
  sourceUrl: string
): Promise<PageSchema> {
  // Truncate HTML to keep the prompt manageable
  const htmlExcerpt = truncateHtml(scraped.html, 8000);

  const response = await client!.messages.create({
    model: VISION_MODEL,
    max_tokens: 8192,
    system: VISION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: scraped.screenshot,
            },
          },
          {
            type: 'text',
            text: `Source URL: ${sourceUrl}
Detected fonts: ${scraped.metadata.fonts.join(', ') || 'unknown'}
Detected colors (CSS): ${scraped.metadata.colors.slice(0, 10).join(', ') || 'unknown'}

HTML excerpt (for text extraction):
\`\`\`html
${htmlExcerpt}
\`\`\`

Reconstruct this landing page as the JSON schema described in your instructions.`,
          },
        ],
      },
    ],
  });

  if (response.stop_reason === 'max_tokens') {
    throw new Error('AI response truncated — page too complex. Try a simpler page.');
  }

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected AI response type');

  return parseAiSchema(block.text, sourceUrl);
}

async function reconstructWithHtml(html: string, sourceUrl: string): Promise<PageSchema> {
  const htmlExcerpt = truncateHtml(html, 12000);

  const response = await client!.messages.create({
    model: VISION_MODEL,
    max_tokens: 8192,
    system: VISION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Source URL: ${sourceUrl}

HTML source:
\`\`\`html
${htmlExcerpt}
\`\`\`

Reconstruct this landing page as the JSON schema described in your instructions. No screenshot is available so rely on the HTML.`,
      },
    ],
  });

  if (response.stop_reason === 'max_tokens') {
    throw new Error('AI response truncated — page too complex. Try a simpler page.');
  }

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected AI response type');

  return parseAiSchema(block.text, sourceUrl);
}

function parseAiSchema(raw: string, sourceUrl: string): PageSchema {
  // Strip markdown code fences if present
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/([\s\S]+)/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`AI returned invalid JSON: ${jsonStr.slice(0, 300)}`);
  }

  const schema = parsed as Record<string, unknown>;

  // Ensure required fields exist
  if (!schema.schemaVersion) schema.schemaVersion = 1;
  if (!schema.settings) {
    schema.settings = {
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '1200px',
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
    };
  }
  if (!schema.meta) schema.meta = { title: new URL(sourceUrl).hostname };
  if (!Array.isArray(schema.blocks)) schema.blocks = [];

  // Assign stable IDs and sanitize order
  (schema.blocks as Block[]).forEach((b, i) => {
    if (!b.id) b.id = uuid();
    b.order = i;
    if (b.locked === undefined) b.locked = false;
    if (b.visible === undefined) b.visible = true;
    if (!b.styles) b.styles = {};
  });

  return schema as unknown as PageSchema;
}

// ─── HTML fallback (cheerio heuristics) ────────────────────────────────────────
// Kept from the original importService for when both Playwright and AI are unavailable.

interface ParseResult {
  title: string;
  blocks: Block[];
}

function buildSchema(blocks: Block[], title: string): PageSchema {
  return {
    schemaVersion: 1,
    blocks,
    settings: {
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '1200px',
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
    },
    meta: { title },
  };
}

function parseHtmlToBlocks(html: string, sourceUrl: string): ParseResult {
  const $ = cheerio.load(html);
  const blocks: Block[] = [];
  let order = 0;

  const title =
    $('title').first().text().trim() ||
    $('h1').first().text().trim() ||
    'Imported Page';

  $('script, style, noscript, nav, footer, header, [aria-hidden="true"]').remove();

  const mainSelectors = ['main', '[role="main"]', '#main', '#content', '.main-content', 'article', 'body'];
  let $main = $('body');
  for (const sel of mainSelectors) {
    if ($(sel).length) { $main = $(sel); break; }
  }

  // Hero
  const $h1 = $main.find('h1').first();
  if ($h1.length) {
    const headline = $h1.text().trim();
    const $nextP = $h1.next('p, h2, h3');
    const subheadline = $nextP.is('p') ? $nextP.first().text().trim() : undefined;
    const $btn = $h1.parent().find('a[href], button').first();
    const ctaLabel = $btn.length ? $btn.text().trim().slice(0, 100) : undefined;
    const ctaHref = $btn.attr('href') || undefined;
    const bgStyle = $h1.parent().attr('style') || '';
    const bgMatch = bgStyle.match(/background(?:-image)?\s*:[^;]*url\(['"]?([^'")\s]+)['"]?\)/i);
    const backgroundImage = bgMatch ? resolveUrl(bgMatch[1], sourceUrl) : undefined;
    blocks.push({ id: uuid(), type: 'hero', order: order++, locked: false, visible: true, styles: {},
      props: { headline, subheadline, ctaLabel, ctaHref, backgroundImage, alignment: 'center' } });
  }

  // FAQ
  const faqItems: Array<{ id: string; question: string; answer: string }> = [];
  $main.find('dt').each((_, el) => {
    const question = $(el).text().trim();
    const answer = $(el).next('dd').text().trim();
    if (question && answer) faqItems.push({ id: uuid(), question, answer });
  });
  if (faqItems.length >= 2) {
    blocks.push({ id: uuid(), type: 'faq', order: order++, locked: false, visible: true, styles: {},
      props: { heading: 'FAQ', items: faqItems.slice(0, 20) } });
  }

  // Testimonials
  const testimonialItems: Array<{ id: string; quote: string; authorName: string }> = [];
  $main.find('blockquote').each((_, el) => {
    const quote = $(el).find('p').first().text().trim() || $(el).text().trim();
    const cite = $(el).find('cite, footer, .author, .name').first().text().trim();
    if (quote.length > 10) testimonialItems.push({ id: uuid(), quote: quote.slice(0, 500), authorName: cite || 'Customer' });
  });
  if (testimonialItems.length > 0) {
    blocks.push({ id: uuid(), type: 'testimonial', order: order++, locked: false, visible: true, styles: {},
      props: { heading: 'What People Are Saying', layout: 'grid', items: testimonialItems.slice(0, 6) } });
  }

  // Content sections
  $main.find('h2').each((_, el) => {
    const heading = $(el).text().trim();
    if (!heading || heading.length < 3) return;
    const bodyParts: string[] = [];
    let $next = $(el).next();
    while ($next.length && !$next.is('h1,h2,h3')) {
      if ($next.is('p')) bodyParts.push($next.text().trim());
      $next = $next.next();
    }
    const body = bodyParts.join('\n\n').slice(0, 2000);
    if (!body) return;
    const $img = $(el).parent().find('img').first();
    const imageUrl = $img.length ? resolveUrl($img.attr('src') || '', sourceUrl) : undefined;
    const imageAlt = $img.attr('alt') || undefined;
    blocks.push({ id: uuid(), type: 'text_image', order: order++, locked: false, visible: true, styles: {},
      props: { heading, body, imageUrl, imageAlt, imagePosition: order % 2 === 0 ? 'right' : 'left' } });
  });

  // Form
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
      blocks.push({ id: uuid(), type: 'form', order: order++, locked: false, visible: true, styles: {},
        props: { heading: 'Get in Touch', fields, submitLabel: 'Submit' } });
    }
  }

  if (blocks.length === 0) {
    blocks.push({ id: uuid(), type: 'hero', order: 0, locked: false, visible: true, styles: {},
      props: { headline: title, alignment: 'center' } });
  }

  return { title, blocks };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function fetchHtmlFallback(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LPPlatformImporter/1.0)', Accept: 'text/html' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) throw new Error('URL did not return HTML content');
  return response.text();
}

function truncateHtml(html: string, maxChars: number): string {
  if (html.length <= maxChars) return html;
  // Truncate and note it was cut
  return html.slice(0, maxChars) + '\n<!-- [truncated] -->';
}

function resolveUrl(src: string, base: string): string {
  try { return new URL(src, base).toString(); }
  catch { return src; }
}
