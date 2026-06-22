import { chromium } from 'playwright';
const URL = 'https://www.cdbd.in/templates/catalog/online_lookbook/viewer';
const b = await chromium.launch({ headless: true, args:['--disable-blink-features=AutomationControlled','--no-sandbox'] });
const ctx = await b.newContext({
  viewport:{width:390,height:844}, locale:'ko-KR', deviceScaleFactor:2, hasTouch:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
});
const p = await ctx.newPage();
const errs=[];
p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,120)); });
p.on('pageerror', e=> errs.push('PAGEERR:'+String(e).slice(0,120)));
const resp = await p.goto(URL, { waitUntil:'domcontentloaded', timeout:60000 });
await p.waitForTimeout(10000);
const info = await p.evaluate(()=>({ imgs:document.querySelectorAll('img').length, txt:(document.body.innerText||'').slice(0,120), h:document.body.scrollHeight, html:document.documentElement.outerHTML.length }));
console.log('status', resp && resp.status());
console.log('info', JSON.stringify(info));
console.log('errs', JSON.stringify(errs.slice(0,5)));
await p.screenshot({ path:'/tmp/olb-dbg2.png' });
await b.close();
