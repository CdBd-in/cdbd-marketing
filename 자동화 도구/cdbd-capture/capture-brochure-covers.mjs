// C-멀티(폰3대·338:3224, screen ratio 0.4535)용 카탈로그 표지(로고+헤더 최상단) 캡처
// 실행: node capture-brochure-covers.mjs
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const W = 390, H = 860;                     // 폰 스크린 비율(0.4535)에 근접(0.4535*860≈390)
const CATALOGS = [
  ['https://www.cdbd.in/templates/catalog/lookbook-offline/viewer', 'lookbook-offline'],
  ['https://www.cdbd.in/templates/catalog/lookbook-online/viewer', 'lookbook-online'],
  ['https://www.cdbd.in/templates/catalog/oak_table/viewer', 'oak_table'],
];
const OUT = resolve('./screenshots/brochure-covers');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [url, name] of CATALOGS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, locale: 'ko-KR', deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(5500);
    // 하단 페이저(N/M) 숨김
    await page.evaluate(() => { for (const el of document.querySelectorAll('div')) { const t=(el.textContent||'').trim(); if(/^\d+\s*\/\s*\d+$/.test(t)){let p=el;for(let i=0;i<5&&p;i++){if(p.className&&/bg-black/.test(p.className.toString())){p.style.display='none';break;}p=p.parentElement;}}}});
    // 콘텐츠(채도 있는 영역) 상단 y 찾기 → 로고/헤더 최상단부터
    const top = await page.evaluate(() => {
      const sat=(c)=>{const m=c.match(/(\d+),\s*(\d+),\s*(\d+)/);if(!m)return false;const[r,g,b]=[+m[1],+m[2],+m[3]];return (Math.max(r,g,b)-Math.min(r,g,b))>22 && Math.max(r,g,b)>40;};
      let t=99999;
      for(const el of document.querySelectorAll('div,section,header,main,img')){const r=el.getBoundingClientRect();if(r.width<300||r.height<20)continue;if(sat(getComputedStyle(el).backgroundColor)||el.tagName==='IMG')t=Math.min(t,r.top);}
      return t===99999?0:Math.max(0,Math.floor(t));
    });
    const clipH = Math.min(H, 900 - top);
    await page.screenshot({ path: join(OUT, `${name}.png`), clip: { x:0, y:top, width:W, height:clipH } });
    console.log(`OK ${name}: top=${top} clip=${W}x${clipH} ratio=${(W/clipH).toFixed(3)}`);
  } catch(e){ console.error(`FAIL ${name}:`, e.message); }
  finally { await ctx.close(); }
}
await browser.close();
