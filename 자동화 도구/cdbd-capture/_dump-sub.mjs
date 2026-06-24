import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'ko-KR', viewport:{width:1440,height:1200} });
const page = await ctx.newPage();
const urls = ['https://home.cdbd.in/invitation','https://home.cdbd.in/businesscard','https://home.cdbd.in/profilelink','https://home.cdbd.in/catalog'];
const out = {};
for (const u of urls) {
  try {
    await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(4500);
    const txt = await page.evaluate(()=>document.body.innerText);
    out[u] = txt;
  } catch(e){ out[u] = 'ERR '+String(e).slice(0,80); }
}
await browser.close();
console.log(JSON.stringify(out));
