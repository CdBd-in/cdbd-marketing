// 여백 YEOBAEK (profilelink/interior-portfolio) 멀티페이지 뷰어 — 페이지별 전체 캡처(헤더~네비게이터)
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/profilelink/interior-portfolio/viewer';
const W=430,H=926;
const OUT=resolve('./screenshots/usecase14'); if(!existsSync(OUT))mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:W,height:H},locale:'ko-KR',deviceScaleFactor:3});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4500);
const readPager=async()=>p.evaluate(()=>{const m=document.body.innerText.replace(/\s+/g,'').match(/([1-9]\d*)\/([1-9]\d*)/);return m?{cur:+m[1],total:+m[2]}:null;});
let pg=await readPager(); console.log('pager',pg);
const total=pg?pg.total:4;
for(let i=1;i<=total;i++){
  await p.waitForTimeout(1400);
  await p.screenshot({path:join(OUT,`yeobaek-p${i}.png`),clip:{x:0,y:0,width:W,height:H}});
  console.log('📸 p'+i, (await readPager()));
  if(i<total){
    await p.mouse.move(370,430); await p.mouse.down();
    for(let x=370;x>=60;x-=40){ await p.mouse.move(x,430); await p.waitForTimeout(25); }
    await p.mouse.up();
    await p.waitForTimeout(1200);
  }
}
await b.close();
console.log('done');
