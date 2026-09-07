import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
await c.addInitScript(()=>{
  window.__maps=[];
  const iv=setInterval(()=>{
    if(window.naver&&window.naver.maps&&window.naver.maps.Map&&!window.naver.maps.Map.__w){
      const O=window.naver.maps.Map;
      const P=new Proxy(O,{construct(t,args,nt){const i=Reflect.construct(t,args,nt);window.__maps.push(i);return i;}});
      P.__w=true; window.naver.maps.Map=P; clearInterval(iv);
    }
  },15);
});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,1000));
await p.waitForTimeout(4000);
const st = await p.evaluate(()=>({n:window.__maps.length, zooms:window.__maps.map(m=>{try{return {zoom:m.getZoom(), center:String(m.getCenter()), size:String(m.getSize())};}catch(e){return String(e);}})}));
console.log('captured maps:', JSON.stringify(st));
for(const z of [15,16,17,18]){
  await p.evaluate((zz)=>{window.__maps.forEach(m=>m.setZoom(zz,false));}, z);
  await p.waitForTimeout(2500);
  const s=await p.evaluate(()=>{const el=[...document.querySelectorAll('span,div')].find(e=>!e.children.length&&/^\d+m$/.test(e.textContent.trim()));return el?el.textContent.trim():null;});
  console.log('zoom',z,'-> scale',s);
}
await b.close();
