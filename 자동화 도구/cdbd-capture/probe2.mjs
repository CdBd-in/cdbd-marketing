import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4000);
await page.evaluate(async () => { await new Promise(r => { let y=0; const t=setInterval(()=>{ window.scrollBy(0,800); y+=800; if(y>=document.body.scrollHeight){clearInterval(t);r();} },80); }); });
await page.waitForTimeout(2000);

const allHrefs = await page.evaluate(() => {
  const hrefs = new Set();
  for (const a of Array.from(document.querySelectorAll('a[href]'))) hrefs.add(a.getAttribute('href'));
  return Array.from(hrefs);
});
console.log('=== ALL HREFS ('+allHrefs.length+') ===');
console.log(JSON.stringify(allHrefs, null, 2));

console.log('=== TITLE ===', await page.title());
console.log('=== URL ===', page.url());
await browser.close();
