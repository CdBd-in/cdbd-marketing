import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(6000);
await page.evaluate(async () => { await new Promise(r => { let y=0; const t=setInterval(()=>{ window.scrollBy(0,600); y+=600; if(y>=document.body.scrollHeight){clearInterval(t);r();} },100); }); });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const iframes = Array.from(document.querySelectorAll('iframe')).map(f=>({src:f.src,id:f.id,w:f.clientWidth,h:f.clientHeight}));
  // elements with onclick or role=link or data-hook
  const clickys = [];
  for (const el of Array.from(document.querySelectorAll('[data-hook],[role="link"],[role="button"],button'))) {
    const t = (el.textContent||'').trim().slice(0,40);
    const dh = el.getAttribute('data-hook');
    if (t || dh) clickys.push({tag:el.tagName, dataHook:dh, role:el.getAttribute('role'), text:t});
  }
  return { iframes, clickyCount: clickys.length, clickys: clickys.slice(0,60), bodyTextLen: document.body.innerText.length, bodySample: document.body.innerText.slice(0,500) };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
