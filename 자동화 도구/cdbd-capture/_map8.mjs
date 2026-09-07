import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
await c.addInitScript(()=>{
  window.__maps=[]; window.__ctor=0;
  let _naver;
  Object.defineProperty(window,'naver',{configurable:true,
    get(){return _naver;},
    set(v){ _naver=v;
      if(v&&v.maps){ patch(v.maps); }
      else if(v){ let _m; Object.defineProperty(v,'maps',{configurable:true,get(){return _m;},set(mv){_m=mv;patch(mv);}}); }
    }});
  function patch(maps){
    if(!maps) return;
    let _M;
    const install=(M)=>{ if(!M||M.__w) return M;
      const P=new Proxy(M,{construct(t,a,nt){window.__ctor++;const i=Reflect.construct(t,a,nt);window.__maps.push({i,args:a&&a[0]&&(a[0].id||String(a[0].tagName||a[0]))});return i;}});
      P.__w=true; return P; };
    if(maps.Map){ _M=install(maps.Map); try{maps.Map=_M;}catch(e){} }
    try{ Object.defineProperty(maps,'Map',{configurable:true,get(){return _M;},set(v){_M=install(v);}}); }catch(e){}
  }
});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,994));
await p.waitForTimeout(3500);
const st = await p.evaluate(()=>({
  ctor: window.__ctor, n: window.__maps.length,
  maps: window.__maps.map(({i})=>{ let el=null; try{el=i.getElement();}catch(e){}
    const r=el?el.getBoundingClientRect():null;
    return {zoom:i.getZoom(), size:String(i.getSize()), elW:r?Math.round(r.width):null, elH:r?Math.round(r.height):null, inDoc: el?document.contains(el):null};})
}));
console.log(JSON.stringify(st,null,1));
await b.close();
