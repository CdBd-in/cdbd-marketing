import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/catalog/startup-deck', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: '/tmp/startup_full.png' });
const info = await page.evaluate(() => {
  const txt = document.body.innerText;
  const pager = (txt.match(/\b\d\s*\/\s*\d\b/g) || []).slice(0,5);
  const vw = window.innerWidth; let best=0, ch=0;
  for (const el of document.querySelectorAll('div')){
    const cs=getComputedStyle(el); if(!/(auto|scroll)/.test(cs.overflowY)) continue;
    const r=el.getBoundingClientRect(); if(r.x < vw*0.4) continue;
    if(el.scrollHeight>best){best=el.scrollHeight; ch=el.clientHeight;}
  }
  return { pager, scrollH: best, clientH: ch, headings: Array.from(document.querySelectorAll('h1,h2,h3')).slice(0,10).map(h=>h.innerText.trim()).filter(Boolean) };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
