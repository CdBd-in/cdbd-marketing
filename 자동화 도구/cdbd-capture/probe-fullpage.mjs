import { chromium } from 'playwright';
import { resolve, join } from 'path';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport:{width:390,height:844}, locale:'ko-KR', deviceScaleFactor:2 });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/catalog/lookbook-offline/viewer',{waitUntil:'load',timeout:60000});
await page.waitForTimeout(5000);
await page.evaluate(()=>{for(const el of document.querySelectorAll('div')){const t=(el.textContent||'').trim();if(/^\d+\/\d+$/.test(t)){let p=el;for(let i=0;i<4&&p;i++){if(p.className&&/bg-black/.test(p.className.toString())){p.style.display='none';break;}p=p.parentElement;}}}});
// 이미지(img) 요소들의 위치/크기
const imgs = await page.evaluate(()=>{
  return [...document.querySelectorAll('img')].map(im=>{const r=im.getBoundingClientRect();return {y:Math.round(r.top),h:Math.round(r.height),w:Math.round(r.width),x:Math.round(r.left),src:(im.src||'').slice(-30)};}).filter(i=>i.w>100);
});
console.log("IMGS:", JSON.stringify(imgs,null,1));
await page.screenshot({path:resolve('./screenshots/catalog-covers/_probe-full.png')});
await browser.close();
