import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const OUT='screenshots/vip01-gala'; mkdirSync(OUT,{recursive:true});
const SLUG='invitation/gala-rsvp';
const OFFSETS=[['a-cover',0],['b-seat',730],['c-form',1580],['d-location',2200]];
const b = await chromium.launch({headless:true});
const ctx = await b.newContext({viewport:{width:390,height:840}, deviceScaleFactor:3, locale:'ko-KR', isMobile:true, hasTouch:true});
const p = await ctx.newPage();
await p.goto(`https://www.cdbd.in/templates/${SLUG}/viewer`,{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(4000);
await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,400);y+=400;if(y>=document.body.scrollHeight+800){clearInterval(t);r();}},90);});});
await p.waitForTimeout(2000);
for(const [name,y] of OFFSETS){
  await p.evaluate(v=>window.scrollTo(0,v), y);
  await p.waitForTimeout(1200);
  await p.screenshot({path:`${OUT}/gala-${name}.png`});
  console.log('shot', name, y);
}
await b.close(); console.log('DONE');
