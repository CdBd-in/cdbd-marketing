import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/catalog/newarrival', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4000);
const struct = await page.evaluate(() => {
  const vw = window.innerWidth; const boxes=[];
  for (const el of Array.from(document.querySelectorAll('div,section,canvas,img'))) {
    const r = el.getBoundingClientRect();
    if (r.width>200 && r.height>300 && r.x>vw*0.4) {
      const cs=getComputedStyle(el);
      boxes.push({tag:el.tagName,cls:(el.className||'').toString().slice(0,75),w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y),br:cs.borderRadius,border:cs.borderWidth});
    }
  }
  boxes.sort((a,b)=>a.x-b.x||a.y-b.y);
  return boxes.slice(0,20);
});
console.log(JSON.stringify(struct, null, 2));
await browser.close();
