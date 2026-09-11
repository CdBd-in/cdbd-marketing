import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const b = await chromium.launch({headless:true});
const ctx = await b.newContext({viewport:{width:1440,height:1200}, locale:'ko-KR', deviceScaleFactor:3});
const p = await ctx.newPage();
await p.goto('https://www.cdbd.in/templates/catalog/beauty-catalog', {waitUntil:'networkidle', timeout:60000});
await p.waitForTimeout(4000);

const data = await p.evaluate(()=>{
  const out={texts:[],images:[],cards:[]};
  const seen=new Set();
  const want=['ONDAM','온담 · 피부가','2026 NEW','덜어내는 스킨케어','CLEAN PROMISE','병풀 95%','비건 ·','무향료 ·','약산성 pH'];
  for (const el of Array.from(document.querySelectorAll('*'))){
    const t=(el.textContent||'').trim();
    if(!t || t.length>120) continue;
    if(!want.some(w=>t.startsWith(w))) continue;
    if(el.children.length>0) continue;
    const r=el.getBoundingClientRect(); if(r.width<2) continue;
    const cs=getComputedStyle(el);
    const key=t+r.x+r.y; if(seen.has(key)) continue; seen.add(key);
    out.texts.push({text:t, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height),
      font:cs.fontFamily, size:cs.fontSize, weight:cs.fontWeight, ls:cs.letterSpacing, lh:cs.lineHeight,
      color:cs.color, align:cs.textAlign,
      bg:cs.backgroundColor, pad:[cs.paddingTop,cs.paddingRight,cs.paddingBottom,cs.paddingLeft],
      radius:cs.borderRadius});
  }
  for (const im of Array.from(document.querySelectorAll('img'))){
    const r=im.getBoundingClientRect();
    if(r.width<80||r.height<80) continue;
    out.images.push({src:im.currentSrc||im.src, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), nw:im.naturalWidth, nh:im.naturalHeight, alt:im.alt});
  }
  return out;
});
writeFileSync('/tmp/cdbd-node/ondam-dom.json', JSON.stringify(data,null,2));
console.log(JSON.stringify(data.texts,null,1).slice(0,6000));
console.log('\n--- IMAGES ---');
console.log(JSON.stringify(data.images,null,1).slice(0,3000));
await b.close();
