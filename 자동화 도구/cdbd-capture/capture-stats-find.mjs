// 로그인 → 여러 페이지 통계 순회 → 데이터(페이지뷰>0) 있는 첫 페이지를 고해상도 클립 캡처
import { chromium } from 'playwright';
import 'dotenv/config';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { loginAndEnterEditor } from './lib/cdbd-auth.mjs';

const IDS = [2524,3216,3422,3576,3700,3701,4817,4865,3030];
const OUT = resolve('./screenshots/catalog'); if (!existsSync(OUT)) mkdirSync(OUT,{recursive:true});
const browser = await chromium.launch({ headless: process.env.HEADLESS!=='false' });
const ctx = await browser.newContext({ viewport:{width:1440,height:1100}, deviceScaleFactor:2, locale:'ko-KR' });
const page = await ctx.newPage();
await loginAndEnterEditor(page, ctx);
console.error('로그인 OK');

async function readPV(){
  return await page.evaluate(()=>{
    const lab=[...document.querySelectorAll('*')].find(e=>e.children.length===0 && e.textContent.trim()==='페이지뷰');
    if(!lab) return null;
    let card=lab.parentElement; // 페이지뷰 카드
    const nums=(card.textContent||'').replace(/페이지뷰/,'').match(/\d[\d,]*/);
    return nums?parseInt(nums[0].replace(/,/g,'')):0;
  });
}
async function clip(label, mustText, minH){
  const box=await page.evaluate(({mustText,minH})=>{
    const h=[...document.querySelectorAll('*')].find(e=>e.children.length===0 && e.textContent.trim()===mustText);
    if(!h) return null;
    let c=h; while(c && c.getBoundingClientRect().height<minH) c=c.parentElement;
    if(!c) return null; const r=c.getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height};
  },{mustText,minH});
  if(!box){console.error(label,'no-el');return false;}
  const pad=10;
  await page.screenshot({path:join(OUT,`${label}.png`),clip:{x:Math.max(0,box.x-pad),y:Math.max(0,box.y-pad),width:box.width+pad*2,height:box.height+pad*2}});
  console.error(label,'OK',JSON.stringify(box));
  return true;
}

let picked=null;
for(const id of IDS){
  await page.goto(`https://www.cdbd.in/stats/${id}/view`,{waitUntil:'networkidle',timeout:45000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const pv=await readPV();
  console.error(`id ${id}: 페이지뷰=${pv}`);
  if(pv && pv>0){ picked=id; break; }
}
if(picked){
  console.error('PICKED', picked);
  await page.waitForTimeout(1000);
  await clip('stat-card-hi','통계 요약',350);
  await clip('click-summary-hi','클릭 요약',120);
  await page.screenshot({path:join(OUT,'stats-full-hi.png'),fullPage:true});
} else console.error('NO DATA PAGE FOUND');
await browser.close();
console.log('done picked='+picked);
