import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/catalog/newarrival', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);
// dump buttons on right half + any page indicator text + svg/arrows
const info = await page.evaluate(() => {
  const vw = window.innerWidth;
  const btns = [];
  for (const el of document.querySelectorAll('button,[role="button"],svg,a')) {
    const r = el.getBoundingClientRect();
    if (r.x > vw*0.4 && r.width>0 && r.height>0 && r.width<120 && r.height<120) {
      btns.push({ tag: el.tagName, cls:(el.className||'').toString().slice(0,50), aria: el.getAttribute('aria-label'), text:(el.textContent||'').trim().slice(0,20), w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x), y:Math.round(r.y) });
    }
  }
  // page indicator like 1/4
  const bodyTxt = document.body.innerText;
  const pager = (bodyTxt.match(/\b[1-9]\s*\/\s*[1-9]\b/g)||[]);
  return { rightControls: btns.slice(0,30), pager };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
