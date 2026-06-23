import { chromium } from 'playwright';
const URL = 'https://www.cdbd.in/allincomplete_FlagshipStore/Invitation';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);
await page.evaluate(async () => { await new Promise(r => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 500); y += 500; if (y > document.body.scrollHeight + 1200) { clearInterval(t); r(); } }, 120); }); });
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

const imgs = await page.evaluate(() => [...document.querySelectorAll('img')].map(im => { const r = im.getBoundingClientRect(); return { y: Math.round(r.top + window.scrollY), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(i => i.w > 40).sort((a, b) => a.y - b.y));
const marks = await page.evaluate(() => {
  const want = ['Date & Time', 'Location', 'GRAND OPENING', 'RSVP', '참석 여부', '제출', '동반 고객', 'LOOK', '컬렉션'];
  const out = [];
  for (const e of document.querySelectorAll('h1,h2,h3,p,span,button,div')) {
    const t = (e.innerText || '').trim(); if (!t || t.length > 30) continue;
    if (want.some(w => t.includes(w))) { const r = e.getBoundingClientRect(); out.push({ t, y: Math.round(r.top + window.scrollY), h: Math.round(r.height) }); }
  }
  const seen = new Set(); return out.filter(o => { const k = o.t + Math.round(o.y / 5); if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.y - b.y);
});
const dims = await page.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight }));
console.log('DIMS', JSON.stringify(dims));
console.log('IMGS'); for (const i of imgs) console.log(`  y=${i.y} h=${i.h} w=${i.w} x=${i.x}`);
console.log('MARKS'); for (const m of marks) console.log(`  y=${m.y} "${m.t}"`);
await browser.close();
