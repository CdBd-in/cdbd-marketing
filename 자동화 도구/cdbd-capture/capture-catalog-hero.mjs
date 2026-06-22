// 카탈로그 히어로 사진을 풀블리드로 캡처 (흰 프레임·여백 제거), ratio 0.648
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
const RATIO=0.6531;
const CATALOGS=[
  ['https://www.cdbd.in/templates/catalog/lookbook-offline/viewer','lookbook-offline'],
  ['https://www.cdbd.in/templates/catalog/newarrival/viewer','newarrival'],
  ['https://www.cdbd.in/templates/catalog/lookbook-online/viewer','lookbook-online'],
];
const OUT=resolve('./screenshots/catalog-covers');
if(!existsSync(OUT))mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});
for(const [url,name] of CATALOGS){
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'ko-KR',deviceScaleFactor:2});
  const page=await ctx.newPage();
  try{
    await page.goto(url,{waitUntil:'load',timeout:60000});
    await page.waitForTimeout(5000);
    // 가장 큰 img (히어로 사진) bbox
    const box=await page.evaluate(()=>{
      let best=null,area=0;
      for(const im of document.querySelectorAll('img')){
        const r=im.getBoundingClientRect();
        if(r.width<150||r.height<150)continue;
        if(r.top<0||r.left<-50)continue; // 화면 밖(다음 슬라이드) 제외
        const a=r.width*r.height;
        if(a>area){area=a;best={x:r.left,y:r.top,w:r.width,h:r.height};}
      }
      return best;
    });
    if(!box){console.log(`❌ ${name}: 히어로 사진 없음`);await ctx.close();continue;}
    // 사진 bbox 중심 기준 ratio 0.648로 클립 (사진 안에서)
    let cw=box.w, ch=cw/RATIO;
    if(ch>box.h){ch=box.h; cw=ch*RATIO;}
    const cx=box.x+box.w/2-cw/2, cy=box.y; // 상단부터(인물 얼굴 보이게)
    await page.screenshot({path:join(OUT,`${name}.png`),clip:{x:Math.max(0,cx),y:Math.max(0,cy),width:Math.round(cw),height:Math.round(ch)}});
    console.log(`✅ ${name}: photo bbox ${Math.round(box.w)}x${Math.round(box.h)} → clip ${Math.round(cw)}x${Math.round(ch)} (ratio ${(cw/ch).toFixed(3)})`);
  }catch(e){console.error(`❌ ${name}:`,e.message);}
  finally{await ctx.close();}
}
await browser.close();
