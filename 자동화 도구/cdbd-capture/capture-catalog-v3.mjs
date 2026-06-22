import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const URL='https://www.cdbd.in/templates/catalog/newarrival/viewer';
const OUT=resolve('./screenshots/catalog-pages');
if(!existsSync(OUT)) mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'ko-KR',deviceScaleFactor:2,hasTouch:true});
const page=await ctx.newPage();
const readPager=async()=>page.evaluate(()=>{for(const el of document.querySelectorAll('*')){const t=(el.textContent||'').trim();if(/^\d+\/\d+$/.test(t))return t;}return null;});
// 채도 있는 색(회색·흰색·검정 제외) 요소들의 union bounding box
const contentBounds=async()=>page.evaluate(()=>{
  const sat=(c)=>{const m=c.match(/(\d+),\s*(\d+),\s*(\d+)/);if(!m)return false;const[r,g,b]=[+m[1],+m[2],+m[3]];const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return (mx-mn)>25 && mx>40;};
  let top=99999,bot=0,found=false;
  for(const el of document.querySelectorAll('div,section,header,main')){
    const r=el.getBoundingClientRect();
    if(r.width<300||r.height<20||r.height>844)continue;
    const bg=getComputedStyle(el).backgroundColor;
    if(sat(bg)){found=true;top=Math.min(top,r.top);bot=Math.max(bot,r.bottom);}
  }
  if(!found)return null;
  top=Math.max(0,Math.floor(top));bot=Math.min(844,Math.ceil(bot));
  return {x:0,y:top,width:390,height:bot-top};
});
const swipeNext=async()=>{await page.mouse.move(312,422);await page.mouse.down();await page.mouse.move(78,422,{steps:15});await page.mouse.up();await page.waitForTimeout(1300);};
try{
  await page.goto(URL,{waitUntil:'load',timeout:60000});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{for(const el of document.querySelectorAll('div')){const t=(el.textContent||'').trim();if(/^\d+\/\d+$/.test(t)){let p=el;for(let i=0;i<4&&p;i++){if(p.className&&/bg-black/.test(p.className.toString())){p.style.display='none';break;}p=p.parentElement;}}}});
  for(let i=1;i<=4;i++){
    await page.waitForTimeout(700);
    const b=await contentBounds();
    const path=join(OUT,`nvc-page${i}.png`);
    if(b&&b.height>200){await page.screenshot({path,clip:b});console.log(`p${i} (${await readPager()}) clip y=${b.y} h=${b.height}`);}
    else{await page.screenshot({path});console.log(`p${i} bounds실패 풀캡처`);}
    if(i<4){const pg=await readPager();await swipeNext();if(await readPager()===pg){await page.keyboard.press('ArrowRight');await page.waitForTimeout(1000);}}
  }
}catch(e){console.error('ERR',e.message);}finally{await browser.close();}
