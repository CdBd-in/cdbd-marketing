import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4000);

// Click all "전체 보기" buttons to reveal every card
const expandBtns = await page.getByRole('button', { name: /전체 보기/ }).all();
console.log('expand buttons:', expandBtns.length);
for (const b of expandBtns) { try { await b.click({ timeout: 3000 }); await page.waitForTimeout(800); } catch(e){ console.log('expand err', e.message);} }
await page.waitForTimeout(1500);

// enumerate template cards: buttons whose text starts with 원페이지/멀티페이지 and has a description
const cards = await page.evaluate(() => {
  const out = [];
  let i = 0;
  for (const el of Array.from(document.querySelectorAll('button'))) {
    const t = (el.textContent||'').trim();
    if (/^(원페이지|멀티페이지)/.test(t) && t.length > 12) {
      const r = el.getBoundingClientRect();
      out.push({ i: i++, text: t.slice(0,60), x:Math.round(r.x), y:Math.round(r.y) });
    }
  }
  return out;
});
console.log('=== CARDS ('+cards.length+') ===');
console.log(JSON.stringify(cards, null, 2));

// Click the first card, observe navigation
const cardEls = await page.evaluate(() => null); // placeholder
const firstCard = page.locator('button').filter({ hasText: /^원페이지.*품격/ }).first();
try {
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.click({ timeout: 5000 });
  await page.waitForTimeout(4000);
  console.log('=== AFTER CLICK URL ===', page.url());
  // dump structure
  const struct = await page.evaluate(() => {
    const vw = window.innerWidth;
    const iframes = Array.from(document.querySelectorAll('iframe')).map(f=>({src:f.src,w:f.clientWidth,h:f.clientHeight}));
    const boxes=[];
    for (const el of Array.from(document.querySelectorAll('div,section,figure,canvas'))) {
      const r = el.getBoundingClientRect();
      if (r.width>200 && r.height>400 && r.x>vw*0.4) {
        const cs=getComputedStyle(el);
        boxes.push({tag:el.tagName,cls:(el.className||'').toString().slice(0,60),w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y),br:cs.borderRadius,border:cs.border});
      }
    }
    boxes.sort((a,b)=>a.x-b.x);
    return { iframes, boxes: boxes.slice(0,15) };
  });
  console.log(JSON.stringify(struct, null, 2));
} catch(e){ console.log('click err', e.message); }
await browser.close();
