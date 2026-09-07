import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0);});
await p.waitForTimeout(1500);
const info = await p.evaluate(()=>{
  const res=[];
  const all=document.querySelectorAll('*');
  for(const el of all){
    const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
    if(!own.trim()) continue;
    const r=el.getBoundingClientRect();
    const y=Math.round(r.top+window.scrollY);
    if(y<950 || y>2000) continue;
    res.push({y, h:Math.round(r.height), tag:el.tagName, cls:String(el.className||'').slice(0,70), text:own.trim().slice(0,90)});
  }
  // also iframes/imgs in that band
  const media=[];
  for(const el of document.querySelectorAll('img,iframe,canvas,svg')){
    const r=el.getBoundingClientRect(); const y=Math.round(r.top+window.scrollY);
    if(y<950||y>2000) continue;
    media.push({y,h:Math.round(r.height),w:Math.round(r.width),tag:el.tagName,src:String(el.src||'').slice(0,80)});
  }
  return {docH:document.body.scrollHeight, res, media};
});
console.log('docH',info.docH);
console.log('--- TEXT ---');
for(const it of info.res) console.log(it.y, it.h, it.tag, JSON.stringify(it.text), '|', it.cls);
console.log('--- MEDIA ---');
for(const m of info.media) console.log(m.y,m.w,m.h,m.tag,m.src);
await b.close();
