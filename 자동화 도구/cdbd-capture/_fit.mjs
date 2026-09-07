import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
const r = await p.evaluate(()=>{
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); const ns=[];
  while(w.nextNode()) ns.push(w.currentNode);
  const addr=ns.find(n=>n.textContent.trim()==='강남구 테헤란로5길 7 KG Tower');
  const cands=['KG Tower, 7 Teheran-ro 5-gil','7 Teheran-ro 5-gil, Gangnam-gu','KG Tower, 7 Teheran-ro 5-gil, Gangnam-gu','KG Tower, Teheran-ro 5-gil, Gangnam-gu'];
  const out=[];
  let block=addr.parentElement; while(block&&getComputedStyle(block).display.includes('inline')) block=block.parentElement;
  const avail=block.getBoundingClientRect().width;
  for(const t of cands){
    addr.textContent=t;
    const rg=document.createRange(); rg.selectNodeContents(addr);
    const rects=[...rg.getClientRects()].filter(x=>x.width>1);
    out.push({t, w:Math.round(rects.reduce((a,x)=>a+x.width,0)), lines:rects.length});
  }
  return {avail:Math.round(avail), out};
});
console.log(JSON.stringify(r,null,1));
await b.close();
