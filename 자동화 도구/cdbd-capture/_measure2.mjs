import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,1000));
await p.waitForTimeout(4000);
const scales=[];
for(let i=0;i<6;i++){
  scales.push(await p.evaluate(()=>{const el=[...document.querySelectorAll('span,div')].find(e=>!e.children.length&&/^\d+m$/.test(e.textContent.trim()));return el?el.textContent.trim():null;}));
  await p.waitForTimeout(2000);
}
console.log('SCALES', JSON.stringify(scales));
const m = await p.evaluate(()=>{
  const targets=['*호텔 로비 도착 시 비상등을 켜주시면,','VIP 전담 발렛 서비스가 제공됩니다','강남구 테헤란로5길 7 KG Tower','더 시그니처 호텔 서울,'];
  const out=[];
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); const nodes=[];
  while(w.nextNode()) nodes.push(w.currentNode);
  for(const n of nodes){
    const t=n.textContent.trim(); if(!targets.includes(t)) continue;
    const r=document.createRange(); r.selectNodeContents(n);
    const rect=r.getBoundingClientRect();
    let block=n.parentElement; while(block && getComputedStyle(block).display.includes('inline')) block=block.parentElement;
    const bcs=block?getComputedStyle(block):null, br=block?block.getBoundingClientRect():null;
    out.push({text:t, textW:Math.round(rect.width), font:getComputedStyle(n.parentElement).fontSize,
      blockTag:block&&block.tagName, blockW:br?Math.round(br.width):null,
      avail: br?Math.round(br.width-parseFloat(bcs.paddingLeft)-parseFloat(bcs.paddingRight)):null});
  }
  return out;
});
console.log(JSON.stringify(m,null,1));
await b.close();
