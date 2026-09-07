import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
await c.addInitScript(()=>{window.__maps=[];const iv=setInterval(()=>{if(window.naver&&window.naver.maps&&window.naver.maps.Map&&!window.naver.maps.Map.__w){const O=window.naver.maps.Map;const P=new Proxy(O,{construct(t,a,nt){const i=Reflect.construct(t,a,nt);window.__maps.push(i);return i;}});P.__w=true;window.naver.maps.Map=P;clearInterval(iv);}},15);});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,1050));
await p.waitForTimeout(4000);
const before = await p.evaluate(()=>{
  const scaleEls=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&/^\d+\s*m$/.test(e.textContent.trim()));
  return {n:window.__maps.length,
    scales: scaleEls.map(e=>{const r=e.getBoundingClientRect();return {t:e.textContent.trim(), x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width), vis:r.width>0};}),
    mapEls:[...document.querySelectorAll('div')].filter(d=>d.querySelector('img[src*="nrbe.pstatic.net"]')).slice(0,3).map(d=>{const r=d.getBoundingClientRect();return {cls:String(d.className).slice(0,40),x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)};})
  };
});
console.log('BEFORE', JSON.stringify(before,null,1));
// 실제 제스처로 줌인: 지도 중앙에 더블클릭 2회
const box = await p.evaluate(()=>{
  const d=[...document.querySelectorAll('div')].filter(x=>x.querySelector('img[src*="nrbe.pstatic.net"]'))[0];
  const r=d.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};
});
console.log('map box (viewport)', JSON.stringify(box));
const cx=box.x+box.w/2, cy=box.y+box.h/2;
for(let i=0;i<2;i++){ await p.mouse.dblclick(cx,cy); await p.waitForTimeout(2500); }
await p.waitForTimeout(4000);
const after = await p.evaluate(()=>{
  const scaleEls=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&/^\d+\s*m$/.test(e.textContent.trim()));
  return {zoom: window.__maps[0]&&window.__maps[0].getZoom(), scales: scaleEls.map(e=>({t:e.textContent.trim(), w:Math.round(e.getBoundingClientRect().width)}))};
});
console.log('AFTER', JSON.stringify(after));
await p.screenshot({path:'/tmp/map_dbl.png', clip:{x:0,y:0,width:378,height:888}});
await b.close();
