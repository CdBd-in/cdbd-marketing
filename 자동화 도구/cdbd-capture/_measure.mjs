import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.waitForTimeout(3000);
// wait extra for map zoom animation to settle, then read scale text repeatedly
const scales=[];
for(let i=0;i<8;i++){
  const s=await p.evaluate(()=>{const el=[...document.querySelectorAll('span,div')].find(e=>!e.children.length&&/^\d+m$/.test(e.textContent.trim()));return el?el.textContent.trim():null;});
  scales.push(s); await p.waitForTimeout(1500);
}
const m = await p.evaluate(()=>{
  const targets=['*호텔 로비 도착 시 비상등을 켜주시면,','사전 등록된 정보를 바탕으로','VIP 전담 발렛 서비스가 제공됩니다','강남구 테헤란로5길 7 KG Tower','더 시그니처 호텔 서울,','행사 장소 확인하기'];
  const out=[];
  for(const el of document.querySelectorAll('span,div,strong,p')){
    if(el.children.length) continue;
    const t=el.textContent.trim();
    if(!targets.includes(t)) continue;
    const cs=getComputedStyle(el);
    const par=el.parentElement, pr=par.getBoundingClientRect(), pcs=getComputedStyle(par);
    out.push({text:t, w:Math.round(el.getBoundingClientRect().width), font:cs.fontSize, fam:cs.fontFamily.split(',')[0], weight:cs.fontWeight,
      parentW:Math.round(pr.width), parentPad:pcs.padding, avail: Math.round(pr.width - parseFloat(pcs.paddingLeft||0) - parseFloat(pcs.paddingRight||0))});
  }
  return out;
});
console.log('scale samples:', JSON.stringify(scales));
console.log(JSON.stringify(m,null,1));
await b.close();
