import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const OUT='screenshots/w32-464'; mkdirSync(OUT,{recursive:true});
// viewport ar = 390/840 = 0.4643 → matches phone screen clip exactly
const SLUGS=['invitation/prestige','invitation/event-ticket','invitation/seminar'];
const b = await chromium.launch({headless:true});
const ctx = await b.newContext({viewport:{width:390,height:840}, deviceScaleFactor:3, locale:'ko-KR', isMobile:true, hasTouch:true});
const p = await ctx.newPage();
for (const slug of SLUGS){
  const name=slug.replace('/','__');
  try{
    await p.goto(`https://www.cdbd.in/templates/${slug}/viewer`,{waitUntil:'networkidle',timeout:60000});
    await p.waitForTimeout(3500);
    await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,400);y+=400;if(y>=document.body.scrollHeight+800){clearInterval(t);r();}},90);});});
    await p.waitForTimeout(1500);
    const h = await p.evaluate(()=>document.body.scrollHeight);
    const n = Math.min(5, Math.max(1, Math.floor(h/840)));
    for(let i=0;i<n;i++){
      await p.evaluate(y=>window.scrollTo(0,y), i*840);
      await p.waitForTimeout(1000);
      await p.screenshot({path:`${OUT}/${name}-s${i+1}.png`});
    }
    console.log(`OK ${slug} h=${h} shots=${n}`);
  }catch(e){console.log(`FAIL ${slug} — ${e.message.split('\n')[0]}`);}
}
await b.close(); console.log('DONE');
