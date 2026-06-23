import { chromium } from 'playwright';
import { resolve } from 'path';

const URL = 'https://www.cdbd.in/allincomplete_FlagshipStore/Invitation';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);
// scroll fully to trigger lazy-load
await page.evaluate(async () => {
  await new Promise(r => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 500); y += 500; if (y > document.body.scrollHeight + 1200) { clearInterval(t); r(); } }, 120); });
});
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);

await page.screenshot({ path: resolve('./screenshots/allin-full.png'), fullPage: true });

const dims = await page.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight, dpr: window.devicePixelRatio }));
const sections = await page.evaluate(() => {
  const kws = ['룩북', '갤러리', 'LOOK', '참석', '질문', '답변', 'RSVP', '신청', '컬렉션', '상품', '제품', 'GALLERY', 'COLLECTION'];
  const out = [];
  for (const el of document.querySelectorAll('div,section,h1,h2,h3,p,button,span')) {
    const t = (el.innerText || '').trim();
    if (t && t.length < 40 && kws.some(k => t.toUpperCase().includes(k.toUpperCase()))) {
      const r = el.getBoundingClientRect();
      out.push({ text: t.slice(0, 30), y: Math.round(r.top + window.scrollY), h: Math.round(r.height) });
    }
  }
  // dedupe by text+y
  const seen = new Set(); return out.filter(o => { const k = o.text + o.y; if (seen.has(k)) return false; seen.add(k); return true; });
});
console.log('DIMS', JSON.stringify(dims));
console.log('SECTIONS', JSON.stringify(sections.slice(0, 50), null, 1));
await browser.close();
