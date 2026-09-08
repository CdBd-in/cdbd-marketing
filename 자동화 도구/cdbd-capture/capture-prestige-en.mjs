import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/invitation/prestige/viewer';
const W=439, H=943;   // 목업 스크린 실측 비율 그대로
const OUT=resolve('./screenshots/usecase07'); if(!existsSync(OUT)) mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:W,height:H},locale:'ko-KR',deviceScaleFactor:3});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4500);
await p.evaluate(async()=>{let l=0,s=0;while(s<3){const h=document.body.scrollHeight;if(h===l)s++;else{s=0;l=h;}for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,150));}await new Promise(r=>setTimeout(r,800));}});
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(1800);
await p.screenshot({path:join(OUT,'prestige-KO.png'),clip:{x:0,y:0,width:W,height:H}});
console.log('saved', W, H);
await b.close();
