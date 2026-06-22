import { chromium } from 'playwright';
import { resolve, join } from 'path';
const RATIO=0.6484;
const CATALOGS=[
  ['https://www.cdbd.in/templates/catalog/lookbook-offline/viewer','lookbook-offline'],
  ['https://www.cdbd.in/templates/catalog/lookbook-online/viewer','lookbook-online'],
];
const OUT=resolve('./screenshots/catalog-covers');
const browser=await chromium.launch({headless:true});
for(const [url,name] of CATALOGS){
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'ko-KR',deviceScaleFactor:2});
  const page=await ctx.newPage();
  try{
    await page.goto(url,{waitUntil:'load',timeout:60000});
    await page.waitForTimeout(5000);
    const box=await page.evaluate(()=>{
      let best=null,area=0;
      for(const im of document.querySelectorAll('img')){
        const r=im.getBoundingClientRect();
        // 현재 화면 안 이미지만 (off-screen 슬라이드 제외)
        if(r.left<0||r.left>=390||r.top<0||r.top>=844)continue;
        if(r.width<150||r.height<150)continue;
        const a=r.width*r.height;
        if(a>area){area=a;best={x:r.left,y:r.top,w:r.width,h:r.height};}
      }
      return best;
    });
    if(!box){console.log(`❌ ${name}: no hero`);await ctx.close();continue;}
    let cw=box.w, ch=cw/RATIO;
    if(ch>box.h){ch=box.h; cw=ch*RATIO;}
    let cx=box.x+box.w/2-cw/2, cy=box.y;
    cx=Math.max(0,Math.min(cx,390-cw));
    if(cy+ch>844)cy=844-ch;
    cy=Math.max(0,cy);
    await page.screenshot({path:join(OUT,`${name}.png`),clip:{x:cx,y:cy,width:Math.round(cw),height:Math.round(ch)}});
    console.log(`✅ ${name}: bbox ${Math.round(box.w)}x${Math.round(box.h)} @(${Math.round(box.x)},${Math.round(box.y)}) → clip ${Math.round(cw)}x${Math.round(ch)} @(${Math.round(cx)},${Math.round(cy)})`);
  }catch(e){console.error(`❌ ${name}:`,e.message);}
  finally{await ctx.close();}
}
await browser.close();
