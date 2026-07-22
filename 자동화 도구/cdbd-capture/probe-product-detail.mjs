import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const url = 'https://www.cdbd.in/templates/catalog/product-detail/viewer';
const OUT = resolve('./screenshots/brochure-covers');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 860 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5500);
// detect pager (N/M) => multipage
const info = await page.evaluate(() => {
  let pager=null, maxPage=0;
  for (const el of document.querySelectorAll('div,span,p')) {
    const t=(el.textContent||'').trim();
    const m=t.match(/^(\d+)\s*\/\s*(\d+)$/);
    if(m){ pager=t; maxPage=Math.max(maxPage, +m[2]); }
  }
  // full scroll height of content
  const bodyH = document.body.scrollHeight;
  return { pager, maxPage, bodyH, title: document.title };
});
console.log('PROBE:', JSON.stringify(info));
// capture top cover
const top = await page.evaluate(() => {
  const sat=(c)=>{const m=c.match(/(\d+),\s*(\d+),\s*(\d+)/);if(!m)return false;const[r,g,b]=[+m[1],+m[2],+m[3]];return (Math.max(r,g,b)-Math.min(r,g,b))>22 && Math.max(r,g,b)>40;};
  let t=99999;
  for(const el of document.querySelectorAll('div,section,header,main,img')){const r=el.getBoundingClientRect();if(r.width<300||r.height<20)continue;if(sat(getComputedStyle(el).backgroundColor)||el.tagName==='IMG')t=Math.min(t,r.top);}
  return t===99999?0:Math.max(0,Math.floor(t));
});
const clipH = Math.min(860, 900-top);
await page.screenshot({ path: join(OUT,'product-detail.png'), clip:{x:0,y:top,width:390,height:clipH} });
console.log('CAPTURED product-detail top='+top+' clipH='+clipH);
await browser.close();
