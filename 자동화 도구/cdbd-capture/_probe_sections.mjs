import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const W=422;
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:W,height:950},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0);});
await p.waitForTimeout(1500);
const info = await p.evaluate(()=>{
  const out=[];
  const walk=(el,d)=>{
    if(d>14) return;
    for(const ch of el.children){
      const r=ch.getBoundingClientRect();
      const own=[...ch.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).filter(Boolean).join(' | ');
      if(own) out.push({tag:ch.tagName, cls:(ch.className&&ch.className.baseVal!==undefined?ch.className.baseVal:String(ch.className||'')).slice(0,60), y:Math.round(r.top+window.scrollY), h:Math.round(r.height), text:own.slice(0,120)});
      walk(ch,d+1);
    }
  };
  walk(document.body,0);
  return {docH: document.body.scrollHeight, items: out};
});
console.log('docH',info.docH);
for(const it of info.items) console.log(it.y, it.h, it.tag, '|', it.text);
await b.close();
