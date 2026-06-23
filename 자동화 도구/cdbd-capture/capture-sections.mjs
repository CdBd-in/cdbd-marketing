import { chromium } from 'playwright';
import { resolve } from 'path';

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
const clamp = v => Math.max(0, Math.round(v));

// LOOKBOOK: bounding box of the product-image grid (small uniform imgs)
const look = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')].map(im => { const r = im.getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height }; }).filter(i => i.w > 70 && i.w < 230 && i.h > 70 && i.h < 260);
  if (imgs.length < 3) return null;
  const minX = Math.min(...imgs.map(i => i.x)), maxX = Math.max(...imgs.map(i => i.x + i.w));
  const minY = Math.min(...imgs.map(i => i.y)), maxY = Math.max(...imgs.map(i => i.y + i.h));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, count: imgs.length };
});

// RSVP card container
const rsvpBox = await page.evaluate(() => {
  const el = [...document.querySelectorAll('*')].find(e => { const t = e.innerText || ''; return t.includes('참석 여부') && t.includes('불참') && t.length < 200; });
  if (!el) return null;
  let p = el; for (let i = 0; i < 8 && p.parentElement; i++) { const r = p.getBoundingClientRect(); if (r.height > 300 && r.width > 320) break; p = p.parentElement; }
  const r = p.getBoundingClientRect();
  return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
});

console.log('LOOK', JSON.stringify(look));
console.log('RSVP_BOX', JSON.stringify(rsvpBox));

if (look) await page.screenshot({ path: resolve('./screenshots/sec-lookbook.png'), clip: { x: clamp(look.x - 8), y: clamp(look.y - 8), width: clamp(look.w + 16), height: clamp(look.h + 16) } });
if (rsvpBox) await page.screenshot({ path: resolve('./screenshots/sec-rsvp.png'), clip: { x: clamp(rsvpBox.x), y: clamp(rsvpBox.y), width: clamp(rsvpBox.w), height: clamp(rsvpBox.h) } });
await browser.close();
