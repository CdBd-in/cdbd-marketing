import { chromium } from 'playwright';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';

const URL = process.argv[2] || 'https://www.cdbd.in/editor/2813/viewer?refresh=1782280023744';
const OUT = resolve('./screenshots/gyul');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(5000);
// scroll fully to trigger lazy-load
await page.evaluate(async () => {
  await new Promise(r => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 500); y += 500; if (y > document.body.scrollHeight + 1500) { clearInterval(t); r(); } }, 150); });
});
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1500);

await page.screenshot({ path: resolve(OUT, 'gyul-full.png'), fullPage: true });

const dims = await page.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight, dpr: window.devicePixelRatio }));
const texts = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('div,section,h1,h2,h3,h4,p,button,span,label')) {
    const t = (el.innerText || '').trim();
    if (t && t.length < 50) {
      const r = el.getBoundingClientRect();
      if (r.height > 0) out.push({ text: t.slice(0, 40), y: Math.round(r.top + window.scrollY), h: Math.round(r.height) });
    }
  }
  const seen = new Set(); return out.filter(o => { const k = o.text + o.y; if (seen.has(k)) return false; seen.add(k); return true; });
});
console.log('DIMS', JSON.stringify(dims));
console.log('TEXTS', JSON.stringify(texts.slice(0, 80), null, 1));
await browser.close();
