import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR', deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/catalog/newarrival', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/multi-full.png' });
// dump right-half candidate boxes
const r = await page.evaluate(() => {
  const vw=window.innerWidth, out=[];
  for (const el of Array.from(document.querySelectorAll('div,img,canvas'))) {
    const b=el.getBoundingClientRect();
    if (b.width>=200 && b.width<=460 && b.height>=350 && b.x>vw*0.45) {
      const cs=getComputedStyle(el);
      out.push({tag:el.tagName,cls:(el.className||'').toString().slice(0,70),w:Math.round(b.width),h:Math.round(b.height),x:Math.round(b.x),y:Math.round(b.y),br:cs.borderRadius,bw:cs.borderWidth,ov:cs.overflow});
    }
  }
  out.sort((a,b)=>a.y-b.y); return out;
});
console.log(JSON.stringify(r,null,2));
await browser.close();
