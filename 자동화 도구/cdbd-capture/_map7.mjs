import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,994));
await p.waitForTimeout(3500);
const box = await p.evaluate(()=>{
  let e=document.querySelector('img[src*="nrbe.pstatic.net"]');
  while(e&&!(e.getBoundingClientRect().width>100&&e.getBoundingClientRect().width<378&&e.getBoundingClientRect().height>100)) e=e.parentElement;
  const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};
});
console.log('map box', JSON.stringify(box));
const cx=box.x+box.w/2, cy=box.y+box.h/2;
const rd=()=>p.evaluate(()=>({scale:[...document.querySelectorAll('*')].filter(e=>!e.children.length&&/^\d+\s*m$/.test(e.textContent.trim())&&e.getBoundingClientRect().width>0).map(e=>e.textContent.trim()), scrollY:Math.round(window.scrollY)}));
console.log('start', JSON.stringify(await rd()));
for(let i=1;i<=2;i++){
  await p.mouse.dblclick(cx,cy);
  await p.waitForTimeout(3000);
  console.log('after dblclick',i, JSON.stringify(await rd()));
}
await p.waitForTimeout(4000);
console.log('final', JSON.stringify(await rd()));
await p.screenshot({path:'/tmp/map_dbl2.png', clip:{x:0,y:0,width:378,height:888}});
await b.close();
