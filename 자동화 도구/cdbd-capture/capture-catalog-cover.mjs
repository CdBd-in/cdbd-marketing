// 카탈로그 표지(상단: 로고+헤드배너)를 멀티페이지 목업 #FFFFFF(ratio 0.648)에 맞춰 캡처
// 실행: node capture-catalog-cover.mjs (3개 카탈로그 일괄)
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const RATIO = 0.6484;                 // Rectangle 3424 (#FFFFFF) 비율
const W = 390, H = Math.round(W / RATIO); // 390 x 602
const CATALOGS = [
  ['https://www.cdbd.in/templates/catalog/lookbook-offline/viewer', 'lookbook-offline'],
  ['https://www.cdbd.in/templates/catalog/newarrival/viewer', 'newarrival'],
  ['https://www.cdbd.in/templates/catalog/lookbook-online/viewer', 'lookbook-online'],
];
const OUT = resolve('./screenshots/catalog-covers');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [url, name] of CATALOGS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, locale: 'ko-KR', deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(5000);
    // 페이저 바 숨김
    await page.evaluate(() => { for (const el of document.querySelectorAll('div')) { const t=(el.textContent||'').trim(); if(/^\d+\/\d+$/.test(t)){let p=el;for(let i=0;i<4&&p;i++){if(p.className&&/bg-black/.test(p.className.toString())){p.style.display='none';break;}p=p.parentElement;}}}});
    // 콘텐츠(채도 영역) 상단 y 찾기
    const top = await page.evaluate(() => {
      const sat=(c)=>{const m=c.match(/(\d+),\s*(\d+),\s*(\d+)/);if(!m)return false;const[r,g,b]=[+m[1],+m[2],+m[3]];return (Math.max(r,g,b)-Math.min(r,g,b))>25 && Math.max(r,g,b)>40;};
      let t=99999;
      for(const el of document.querySelectorAll('div,section,header,main')){const r=el.getBoundingClientRect();if(r.width<300||r.height<20)continue;if(sat(getComputedStyle(el).backgroundColor))t=Math.min(t,r.top);}
      return t===99999?0:Math.max(0,Math.floor(t));
    });
    // 상단부터 H 높이로 클립 (로고+헤더 다 보이게)
    const clipH = Math.min(H, 844 - top);
    await page.screenshot({ path: join(OUT, `${name}.png`), clip: { x:0, y:top, width:W, height:clipH } });
    console.log(`✅ ${name}: top=${top} clip=${W}x${clipH} (ratio ${(W/clipH).toFixed(3)})`);
  } catch(e){ console.error(`❌ ${name}:`, e.message); }
  finally { await ctx.close(); }
}
await browser.close();
