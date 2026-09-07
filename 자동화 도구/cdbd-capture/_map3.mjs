import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
await c.addInitScript(()=>{
  window.__maps=[];
  const iv=setInterval(()=>{
    if(window.naver&&window.naver.maps&&window.naver.maps.Map&&!window.naver.maps.Map.__w){
      const O=window.naver.maps.Map;
      const P=new Proxy(O,{construct(t,a,nt){const i=Reflect.construct(t,a,nt);window.__maps.push(i);return i;}});
      P.__w=true; window.naver.maps.Map=P; clearInterval(iv);
    }
  },15);
});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,1050));
await p.waitForTimeout(4000);
const r1=await p.evaluate(()=>{const m=window.__maps[0];m.setZoom(17,false);return m.getZoom();});
await p.waitForTimeout(3000);
const r2=await p.evaluate(()=>{
  const m=window.__maps[0];
  const scale=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&/^\d+\s*m$/.test(e.textContent.trim())).map(e=>e.textContent.trim());
  return {zoom:m.getZoom(), scale};
});
console.log('after setZoom17:', r1, JSON.stringify(r2));
await p.screenshot({path:'/tmp/map_z17.png', clip:{x:0,y:0,width:378,height:888}});
await b.close();
