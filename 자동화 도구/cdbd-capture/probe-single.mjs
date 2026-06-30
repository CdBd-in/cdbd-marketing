import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates/invitation/seminar', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4000);
const info = await page.evaluate(() => {
  const frame = Array.from(document.querySelectorAll('div')).find(d => {
    const c=(d.className||'').toString(); return c.includes('rounded-[19px]')&&c.includes('border-[6px]');
  });
  const inner = frame.firstElementChild;
  // actual content bottom: max bounding bottom among descendants with text/img
  let maxBottom=0, nodeCount=0;
  for (const el of inner.querySelectorAll('*')) {
    const r=el.getBoundingClientRect();
    const hasContent = (el.textContent||'').trim().length>0 || el.tagName==='IMG';
    if (hasContent && r.height>0){ maxBottom=Math.max(maxBottom, r.bottom+window.scrollY); nodeCount++; }
  }
  // scroll containers on right half
  const scrollers=[];
  for (const el of document.querySelectorAll('div')) {
    const cs=getComputedStyle(el);
    if ((cs.overflowY==='auto'||cs.overflowY==='scroll') && el.scrollHeight>el.clientHeight+50){
      const r=el.getBoundingClientRect();
      if (r.x>window.innerWidth*0.4) scrollers.push({cls:(el.className||'').toString().slice(0,60),sh:el.scrollHeight,ch:el.clientHeight,w:Math.round(r.width),h:Math.round(r.height)});
    }
  }
  const fr=frame.getBoundingClientRect();
  return { frameH:Math.round(fr.height), innerScrollH: inner.scrollHeight, innerClientH: inner.clientHeight, contentNodes:nodeCount, contentMaxBottomY:Math.round(maxBottom), frameTopY:Math.round(fr.top+window.scrollY), scrollers };
});
console.log(JSON.stringify(info,null,2));
await browser.close();
