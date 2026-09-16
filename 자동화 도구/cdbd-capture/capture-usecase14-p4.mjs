import { chromium } from 'playwright';
import { resolve, join } from 'path';
const OUT=resolve('./screenshots/usecase14');
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:430,height:926},locale:'ko-KR',deviceScaleFactor:3});
const p=await c.newPage();
await p.goto('https://www.cdbd.in/templates/profilelink/interior-portfolio/viewer',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4500);
const pager=async()=>p.evaluate(()=>{const m=document.body.innerText.replace(/\s+/g,'').match(/([1-9]\d*)\/([1-9]\d*)/);return m?m[0]:null;});
for(let k=0;k<3;k++){
  await p.mouse.move(360,300); await p.mouse.down();
  for(let x=360;x>=70;x-=30){ await p.mouse.move(x,300); await p.waitForTimeout(20); }
  await p.mouse.up(); await p.waitForTimeout(1500);
  console.log('after swipe',k+1,await pager());
}
await p.waitForTimeout(1500);
await p.screenshot({path:join(OUT,'yeobaek-p4.png'),clip:{x:0,y:0,width:430,height:926}});
console.log('final',await pager());
await b.close();
