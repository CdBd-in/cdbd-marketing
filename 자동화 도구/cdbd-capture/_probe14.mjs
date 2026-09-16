import { chromium } from 'playwright';
const b = await chromium.launch({headless:true});
const c = await b.newContext({viewport:{width:430,height:926},locale:'ko-KR',deviceScaleFactor:2});
const p = await c.newPage();
await p.goto('https://www.cdbd.in/templates/profilelink/interior-portfolio/viewer',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4000);
const info = await p.evaluate(()=>{
  const pager = document.body.innerText.replace(/\s+/g,'').match(/([1-9]\d*)\/([1-9]\d*)/);
  const btns = Array.from(document.querySelectorAll('button')).map(x=>{const r=x.getBoundingClientRect();return {t:(x.innerText||'').trim().slice(0,20),al:x.getAttribute('aria-label'),cls:(x.className||'').toString().slice(0,60),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};}).filter(x=>x.w>0);
  const scrollers = Array.from(document.querySelectorAll('*')).filter(e=>e.scrollWidth>e.clientWidth+50).slice(0,6).map(e=>({tag:e.tagName,cls:(e.className||'').toString().slice(0,60),sw:e.scrollWidth,cw:e.clientWidth}));
  return {pager: pager?pager[0]:null, btns: btns.slice(0,25), scrollers, text: document.body.innerText.slice(0,200)};
});
console.log(JSON.stringify(info,null,1));
await b.close();
