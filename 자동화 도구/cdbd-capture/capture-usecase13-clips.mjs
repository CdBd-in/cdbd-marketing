import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/profilelink/corporate-sales/viewer';
const W=430,H=Math.round(430/0.4643);
const OUT=resolve('./screenshots/usecase13b'); if(!existsSync(OUT))mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:W,height:H},locale:'ko-KR',deviceScaleFactor:3});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3500);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.waitForTimeout(800);
const clips={cover:0, lineup:1340, capability:2650, form:3020};
for(const [k,y] of Object.entries(clips)){
  await p.evaluate(yy=>window.scrollTo(0,yy),y);
  await p.waitForTimeout(1200);
  await p.screenshot({path:join(OUT,`cs-${k}.png`),clip:{x:0,y:0,width:W,height:H}});
  console.log('📸',k,y);
}
await b.close();
