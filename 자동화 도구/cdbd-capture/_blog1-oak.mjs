import { chromium } from 'playwright';
const url = 'https://www.cdbd.in/templates/catalog/oak_table/viewer';
const out = '../../.temp/blog-thumb/oak_table-fullpage.png';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true });
await p.goto(url,{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(3500);
// slow full scroll to trigger lazy-load
for(let y=0;y<8000;y+=600){ await p.evaluate(_y=>window.scrollTo(0,_y),y); await p.waitForTimeout(250); }
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: true });
const dim = await p.evaluate(()=>({w:document.body.scrollWidth,h:document.body.scrollHeight}));
console.log('saved', out, JSON.stringify(dim));
await b.close();
