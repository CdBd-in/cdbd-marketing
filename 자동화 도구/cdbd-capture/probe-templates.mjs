// Probe: cdbd.in/templates 목록에서 상세 페이지 링크 수집 + 한 상세 페이지 구조 덤프
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
// full scroll to trigger lazy
await page.evaluate(async () => { await new Promise(r => { let y=0; const t=setInterval(()=>{ window.scrollBy(0,800); y+=800; if(y>=document.body.scrollHeight){clearInterval(t);r();} },80); }); });
await page.waitForTimeout(1500);

const links = await page.evaluate(() => {
  const set = new Map();
  for (const a of Array.from(document.querySelectorAll('a[href]'))) {
    const href = a.href;
    const m = href.match(/\/templates\/([^?#]+)/);
    if (!m) continue;
    const slug = m[1].replace(/\/$/, '');
    if (!slug || slug === '') continue;
    // skip the listing root itself
    if (slug === 'templates') continue;
    set.set(slug, href.split('#')[0].split('?')[0]);
  }
  return Array.from(set.entries()).map(([slug, url]) => ({ slug, url }));
});

console.log('=== TEMPLATE LINKS ===');
console.log(JSON.stringify(links, null, 2));
console.log('TOTAL:', links.length);

// Probe first detail page structure
if (links.length) {
  const d = await ctx.newPage();
  await d.goto(links[0].url, { waitUntil: 'networkidle', timeout: 60000 });
  await d.waitForTimeout(3000);
  const struct = await d.evaluate(() => {
    // find iframes (viewer preview often in iframe) and large image/phone frames on right side
    const out = { iframes: [], bigBoxes: [] };
    for (const f of Array.from(document.querySelectorAll('iframe'))) {
      const r = f.getBoundingClientRect();
      out.iframes.push({ src: f.src, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) });
    }
    // candidate right-side preview containers
    const vw = window.innerWidth;
    for (const el of Array.from(document.querySelectorAll('div,section,figure'))) {
      const r = el.getBoundingClientRect();
      if (r.width > 250 && r.width < 700 && r.height > 400 && r.x > vw*0.45) {
        const cs = getComputedStyle(el);
        out.bigBoxes.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,80), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), br: cs.borderRadius, border: cs.border, overflow: cs.overflow });
      }
    }
    out.bigBoxes.sort((a,b)=>a.x-b.x);
    return out;
  });
  console.log('=== DETAIL PAGE STRUCTURE:', links[0].url, '===');
  console.log(JSON.stringify(struct, null, 2));
}

await browser.close();
