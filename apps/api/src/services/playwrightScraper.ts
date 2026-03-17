import { chromium, type Page } from 'playwright';

export interface PlaywrightResult {
  html: string;
  screenshot: string; // base64 JPEG
  metadata: {
    title: string;
    colors: string[];
    fonts: string[];
  };
}

const VIEWPORT_WIDTH = 1280;
const MAX_PAGE_HEIGHT = 4000;
const NAVIGATION_TIMEOUT_MS = 30000;

export async function scrapeWithPlaywright(url: string): Promise<PlaywrightResult> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: VIEWPORT_WIDTH, height: 900 },
    });
    const page = await context.newPage();

    // Block heavy resources that aren't needed for visual reconstruction
    await page.route('**/*.{mp4,webm,ogg,mp3,wav,flac,aac,woff,woff2,ttf,otf}', (route) =>
      route.abort()
    );

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    // Dismiss common cookie/overlay banners
    await dismissOverlays(page);

    // Scroll to trigger lazy-loaded images, then scroll back to top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Resize viewport to capture as much of the page as possible (capped)
    const pageHeight = await page.evaluate(() =>
      Math.min(document.body.scrollHeight, MAX_PAGE_HEIGHT)
    );
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: pageHeight });

    // Screenshot as JPEG to keep base64 size manageable
    const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 75 });
    const screenshot = screenshotBuffer.toString('base64');

    // Get fully-rendered HTML
    const html = await page.content();

    // Extract color palette and font families from computed styles
    const metadata = await page.evaluate(() => {
      const title = document.title || document.querySelector('h1')?.textContent?.trim() || '';
      const colors = new Set<string>();
      const fonts = new Set<string>();

      let sampled = 0;
      const walk = (el: Element) => {
        if (sampled++ > 300) return;
        const s = window.getComputedStyle(el);
        for (const prop of ['color', 'backgroundColor'] as const) {
          const v = s[prop];
          if (v && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent') colors.add(v);
        }
        const font = s.fontFamily?.split(',')[0].replace(/['"]/g, '').trim();
        if (font) fonts.add(font);
        for (const child of el.children) walk(child);
      };
      walk(document.body);

      return {
        title,
        colors: [...colors].slice(0, 20),
        fonts: [...fonts].slice(0, 6),
      };
    });

    return { html, screenshot, metadata };
  } finally {
    await browser.close();
  }
}

async function dismissOverlays(page: Page) {
  // Best-effort: click common dismiss/accept buttons
  const selectors = [
    '[aria-label*="cookie" i] button',
    '[id*="cookie"] button[id*="accept" i]',
    '[class*="cookie"] button[class*="accept" i]',
    'button[id*="accept-all" i]',
    'button[id*="acceptAll" i]',
    '[data-testid*="cookie-accept"]',
  ];
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) {
        await el.click({ timeout: 500 });
        break;
      }
    } catch {
      // ignore
    }
  }
}
