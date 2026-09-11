import { chromium } from 'playwright';
const slugs = ['catalog/beauty-catalog','catalog/product-detail','catalog/trade-show'];
const b = await chromium.launch({headless:true});
const ctx = await b.newContext({viewport:{width:1440,height:1200}, locale:'ko-KR'});
const p = await ctx.newPage();
for (const s of slugs){
  try{
    await p.goto(`https://www.cdbd.in/templates/${s}`, {waitUntil:'networkidle', timeout:60000});
    await p.waitForTimeout(3500);
    const t = await p.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,300));
    console.log(`\n=== ${s} ===\n${t}`);
  }catch(e){ console.log(`${s} ERR ${e.message.split('\n')[0]}`); }
}
await b.close();
