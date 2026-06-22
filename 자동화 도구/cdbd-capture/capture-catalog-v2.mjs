// 카탈로그 페이지별 콘텐츠 카드만 캡처 (회색 여백·페이저 제외)
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/catalog/newarrival/viewer';
const PREFIX='nv';
const OUT=resolve('./screenshots/catalog-pages');
if(!existsSync(OUT)) mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'ko-KR',deviceScaleFactor:2,hasTouch:true});
const page=await ctx.newPage();
const readPager=async()=>page.evaluate(()=>{for(const el of document.querySelectorAll('*')){const t=(el.textContent||'').trim();if(/^\d+\/\d+$/.test(t))return t;}return null;});
// 콘텐츠 카드 selector 찾기: 폭~390, 높이 큰 colored div (body 직계 아님)
const findCard=async()=>page.evaluate(()=>{
  let best=null,bestArea=0;
  for(const el of document.querySelectorAll('div')){
    const r=el.getBoundingClientRect();
    const bg=getComputedStyle(el).backgroundColor;
    const colored=bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='rgb(255, 255, 255)'&&!bg.includes('0, 0, 0, 0');
    // 페이저(검정 바) 제외: 높이 100 이상
    if(r.width>=330&&r.width<=400&&r.height>=400&&colored){
      const area=r.width*r.height;
      if(area>bestArea){bestArea=area;best={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),bg};}
    }
  }
  return best;
});
const swipeNext=async()=>{await page.mouse.move(312,422);await page.mouse.down();await page.mouse.move(78,422,{steps:15});await page.mouse.up();await page.waitForTimeout(1300);};
try{
  await page.goto(URL,{waitUntil:'load',timeout:60000});
  await page.waitForTimeout(5000);
  // 페이저 바 숨기기
  await page.evaluate(()=>{for(const el of document.querySelectorAll('div')){const t=(el.textContent||'').trim();if(/^\d+\/\d+$/.test(t)){let p=el;for(let i=0;i<3&&p;i++){if(p.className&&/bg-black/.test(p.className.toString())){p.style.display='none';break;}p=p.parentElement;}}}});
  const total=4;
  for(let i=1;i<=total;i++){
    await page.waitForTimeout(700);
    const card=await findCard();
    const path=join(OUT,`${PREFIX}-page${i}.png`);
    if(card){await page.screenshot({path,clip:{x:card.x,y:card.y,width:card.w,height:card.h}});console.log(`p${i} (${await readPager()}) card ${card.w}x${card.h} bg=${card.bg}`);}
    else{await page.screenshot({path});console.log(`p${i} card못찾음 풀캡처`);}
    if(i<total){const b=await readPager();await swipeNext();const a=await readPager();if(a===b){await page.keyboard.press('ArrowRight');await page.waitForTimeout(1000);}}
  }
}catch(e){console.error('ERR',e.message);}finally{await browser.close();}
