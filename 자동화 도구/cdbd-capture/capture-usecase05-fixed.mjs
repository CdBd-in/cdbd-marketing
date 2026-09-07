import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/invitation/gala-rsvp/viewer';
const W=430, H=Math.round(430/0.4643);
const OUT=resolve('./screenshots/usecase05'); if(!existsSync(OUT)) mkdirSync(OUT,{recursive:true});
const SHOTS=[{name:'p-rsvp', y:1690},{name:'p-seat', y:1000}];
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:W,height:H},locale:'ko-KR',deviceScaleFactor:3});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4000);
await p.evaluate(async()=>{let l=0,s=0;while(s<3){const h=document.body.scrollHeight;if(h===l)s++;else{s=0;l=h;}for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,140));}await new Promise(r=>setTimeout(r,700));}});
for(const s of SHOTS){
  await p.evaluate(y=>window.scrollTo(0,y), s.y);
  await p.waitForTimeout(1500);
  await p.screenshot({path:join(OUT,`gala430-${s.name}.png`),clip:{x:0,y:0,width:W,height:H}});
  console.log('📸',s.name,s.y);
}
await b.close(); console.log('done');
