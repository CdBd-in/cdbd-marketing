import { chromium } from 'playwright';
const URL = 'https://www.cdbd.in/templates/catalog/online_lookbook/viewer';
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport:{width:390,height:844}, locale:'ko-KR', deviceScaleFactor:2, hasTouch:true });
const p = await ctx.newPage();
await p.goto(URL, { waitUntil:'networkidle', timeout:60000 });
await p.waitForTimeout(6000);
for (let i=0;i<5;i++){ await p.mouse.wheel(0,400); await p.waitForTimeout(500); }
await p.waitForTimeout(2000);
const info = await p.evaluate(()=>({ imgs: document.querySelectorAll('img').length, bodyText:(document.body.innerText||'').slice(0,150), h: document.body.scrollHeight }));
console.log(JSON.stringify(info));
await p.screenshot({ path:'/tmp/olb-dbg.png', fullPage:false });
await b.close();
