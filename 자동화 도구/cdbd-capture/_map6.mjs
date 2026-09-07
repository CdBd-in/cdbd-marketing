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
const info = await p.evaluate(()=>{
  const tile=document.querySelector('img[src*="nrbe.pstatic.net"]');
  const chain=[]; let e=tile;
  while(e&&e!==document.body){ const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
    chain.push({tag:e.tagName, cls:String(e.className).slice(0,45), w:Math.round(r.width),h:Math.round(r.height), x:Math.round(r.x),y:Math.round(r.y), transform:cs.transform.slice(0,40), overflow:cs.overflow, keys:Object.keys(e).filter(k=>k.startsWith('__')||/naver|map/i.test(k)).slice(0,4)});
    e=e.parentElement; }
  return chain;
});
console.log(JSON.stringify(info,null,1));
await b.close();
