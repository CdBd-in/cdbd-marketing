import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/catalog/newarrival', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4500);
const r = await page.evaluate(() => {
  const vw=window.innerWidth; const out=[];
  for (const el of Array.from(document.querySelectorAll('div'))) {
    const c=(el.className||'').toString();
    if (/rounded-\[|border-\[|device|phone|mockup|frame/i.test(c)) {
      const b=el.getBoundingClientRect();
      if (b.width>150 && b.height>200 && b.x>vw*0.4)
        out.push({cls:c.slice(0,90),w:Math.round(b.width),h:Math.round(b.height),x:Math.round(b.x),y:Math.round(b.y)});
    }
  }
  return out;
});
console.log(JSON.stringify(r,null,2));
await browser.close();
