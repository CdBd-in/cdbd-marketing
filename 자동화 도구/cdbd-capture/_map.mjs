import { chromium } from 'playwright';
const URL='https://www.cdbd.in/templates/invitation/seminar/viewer';
const b=await chromium.launch({headless:true});
const c=await b.newContext({viewport:{width:378,height:888},locale:'ko-KR',deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
await p.evaluate(async()=>{const h=document.body.scrollHeight;for(let y=0;y<=h;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.evaluate(()=>window.scrollTo(0,1000));
await p.waitForTimeout(4000);
const info = await p.evaluate(()=>{
  const out={hasNaver: typeof window.naver!=='undefined'};
  if(window.naver&&window.naver.maps){
    out.mapsKeys = Object.keys(window.naver.maps).slice(0,25);
  }
  // find map container divs
  out.containers=[...document.querySelectorAll('div')].filter(d=>d.className&&String(d.className).includes('map')).map(d=>({cls:String(d.className).slice(0,60),w:Math.round(d.getBoundingClientRect().width),h:Math.round(d.getBoundingClientRect().height)})).slice(0,10);
  // check for iframe map
  out.iframes=[...document.querySelectorAll('iframe')].map(f=>String(f.src).slice(0,120));
  // any element with _naver instance
  const els=[...document.querySelectorAll('*')];
  const found=[];
  for(const e of els){ for(const k of Object.keys(e)){ if(/naver|map/i.test(k)) { found.push({tag:e.tagName,key:k}); break; } } }
  out.instKeys=found.slice(0,10);
  return out;
});
console.log(JSON.stringify(info,null,1));
await b.close();
