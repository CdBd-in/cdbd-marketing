import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const OUT='screenshots/vip01-gala'; mkdirSync(OUT,{recursive:true});
// viewport ar = 390/840 = 0.4643 → matches ①기본 3단 / ④나열 3단 phone screen clip exactly
const SLUG='invitation/gala-rsvp';
const b = await chromium.launch({headless:true});
const ctx = await b.newContext({viewport:{width:390,height:840}, deviceScaleFactor:3, locale:'ko-KR', isMobile:true, hasTouch:true});
const p = await ctx.newPage();
await p.goto(`https://www.cdbd.in/templates/${SLUG}/viewer`,{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(4000);
await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,400);y+=400;if(y>=document.body.scrollHeight+800){clearInterval(t);r();}},90);});});
await p.waitForTimeout(2000);
const h = await p.evaluate(()=>document.body.scrollHeight);
const n = Math.max(1, Math.ceil(h/840));
console.log('scrollHeight', h, 'shots', n);
for(let i=0;i<n;i++){
  await p.evaluate(y=>window.scrollTo(0,y), i*840);
  await p.waitForTimeout(1200);
  await p.screenshot({path:`${OUT}/gala-s${String(i+1).padStart(2,'0')}.png`});
}
// full page for reference
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(800);
await p.screenshot({path:`${OUT}/gala-full.png`, fullPage:true});
await b.close(); console.log('DONE');
