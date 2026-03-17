import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface ScrapedPageContent {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  paragraphs: string[];
  ctaTexts: string[];
  listItems: string[];
}

const MAX_ITEMS = 20;
const FETCH_TIMEOUT_MS = 8000;

export async function scrapeUrl(url: string): Promise<ScrapedPageContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const response = await fetch(url, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signal: controller.signal as any,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LPBot/1.0)' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  // Remove noise
  $('script, style, nav, footer, header, iframe, noscript, [aria-hidden="true"]').remove();

  const title = $('title').first().text().trim() ||
    $('h1').first().text().trim() ||
    '';

  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const headings: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text && headings.length < MAX_ITEMS) headings.push(text);
  });

  const paragraphs: string[] = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 30 && paragraphs.length < MAX_ITEMS) paragraphs.push(text);
  });

  // Buttons and links that look like CTAs
  const ctaTexts: string[] = [];
  $('button, a[href], [class*="cta"], [class*="btn"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 80 && ctaTexts.length < 10) {
      if (!ctaTexts.includes(text)) ctaTexts.push(text);
    }
  });

  const listItems: string[] = [];
  $('li').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 200 && listItems.length < MAX_ITEMS) listItems.push(text);
  });

  return { url, title, metaDescription, headings, paragraphs, ctaTexts, listItems };
}

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s"'<>)]+/g;
  return [...new Set(text.match(urlRegex) ?? [])];
}

export function formatScrapedContent(content: ScrapedPageContent): string {
  const parts: string[] = [
    `## Scraped page: ${content.url}`,
    content.title ? `**Title:** ${content.title}` : '',
    content.metaDescription ? `**Description:** ${content.metaDescription}` : '',
  ];

  if (content.headings.length) {
    parts.push(`**Headings:**\n${content.headings.map(h => `- ${h}`).join('\n')}`);
  }
  if (content.paragraphs.length) {
    parts.push(`**Body copy:**\n${content.paragraphs.map(p => `- ${p}`).join('\n')}`);
  }
  if (content.ctaTexts.length) {
    parts.push(`**CTA/button text:**\n${content.ctaTexts.map(c => `- ${c}`).join('\n')}`);
  }
  if (content.listItems.length) {
    parts.push(`**List items:**\n${content.listItems.map(l => `- ${l}`).join('\n')}`);
  }

  return parts.filter(Boolean).join('\n\n');
}
