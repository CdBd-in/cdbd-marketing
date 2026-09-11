import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const b = await chromium.launch({headless:true});
const ctx = await b.newContext({viewport:{width:1440,height:1200}, locale:'ko-KR'});
const p = await ctx.newPage();
await p.goto('https://www.cdbd.in/templates/catalog/beauty-catalog', {waitUntil:'networkidle', timeout:60000});
await p.waitForTimeout(4000);
const d = await p.evaluate(()=>{
  const find=(txt)=>Array.from(document.querySelectorAll('*')).find(e=>e.children.length===0 && (e.textContent||'').trim().startsWith(txt));
  const logo=find('ONDAM');
  // climb to the viewer root: widest ancestor whose width < 500
  let root=logo, best=logo;
  while(root && root.parentElement){ root=root.parentElement; const r=root.getBoundingClientRect(); if(r.width>0 && r.width<520) best=root; else break; }
  const rr=best.getBoundingClientRect();
  const cs=getComputedStyle(best);
  const rel=(el)=>{const r=el.getBoundingClientRect();return{x:+(r.x-rr.x).toFixed(1),y:+(r.y-rr.y).toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};};
  const out={root:{w:+rr.width.toFixed(1),h:+rr.height.toFixed(1),bg:cs.backgroundColor,radius:cs.borderRadius}, items:[]};
  const labels=['ONDAM','온담 · 피부가','2026 NEW','덜어내는 스킨케어','피부가 스스로','저자극 포뮬러','CLEAN PROMISE'];
  for(const L of labels){ const e=find(L); if(e){ const cs2=getComputedStyle(e);
    let pill=null, q=e;
    for(let i=0;i<3&&q.parentElement;i++){ q=q.parentElement; const c=getComputedStyle(q);
      if(c.backgroundColor!=='rgba(0, 0, 0, 0)'){ pill={bg:c.backgroundColor,radius:c.borderRadius,...rel(q)}; break; } }
    out.items.push({label:L, ...rel(e), size:cs2.fontSize, weight:cs2.fontWeight, font:cs2.fontFamily, color:cs2.color, lh:cs2.lineHeight, ls:cs2.letterSpacing, ancestorBg:pill});
  }}
  // hero image = first big img inside root
  out.imgs=Array.from(best.querySelectorAll('img')).map(im=>({src:im.currentSrc||im.src, ...rel(im), nw:im.naturalWidth, nh:im.naturalHeight})).filter(i=>i.w>100).slice(0,4);
  // dots
  return out;
});
writeFileSync('/tmp/cdbd-node/ondam2.json', JSON.stringify(d,null,2));
console.log(JSON.stringify({root:d.root, items:d.items.map(i=>({l:i.label,x:i.x,y:i.y,w:i.w,h:i.h,size:i.size,weight:i.weight,color:i.color,lh:i.lh,bg:i.ancestorBg}))},null,1));
console.log('IMGS', d.imgs.map(i=>({x:i.x,y:i.y,w:i.w,h:i.h,nw:i.nw,nh:i.nh})));
console.log('SRC0', d.imgs[0] && d.imgs[0].src);
await b.close();
