import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/invitation/popup-reservation/viewer';
const W=430, H=Math.round(430/0.4643);
const OUT=resolve('./screenshots/usecase04'); if(!existsSync(OUT)) mkdirSync(OUT,{recursive:true});
const SHOTS=[
  {name:'p-lookbook', y:712},   // 룩북 사진 + POPUP DURATION / OPENING HOURS
    // SPECIAL GIFT 갤러리
    // RESERVATION 버튼 + 지도 (페이지 하단 한계)
];
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:W,height:H},locale:'ko-KR',deviceScaleFactor:3});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4000);
await p.evaluate(async()=>{let l=0,s=0;while(s<3){const h=document.body.scrollHeight;if(h===l)s++;else{s=0;l=h;}for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,140));}await new Promise(r=>setTimeout(r,700));}});
for(const s of SHOTS){
  await p.evaluate(y=>window.scrollTo(0,y), s.y);
  await p.waitForTimeout(1600);
  await p.screenshot({path:join(OUT,`popup430-${s.name}.png`),clip:{x:0,y:0,width:W,height:H}});
  console.log('📸',s.name,s.y);
}
await b.close(); console.log('done');
