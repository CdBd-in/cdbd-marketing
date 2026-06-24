import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'ko-KR', viewport:{width:1440,height:1200} });
const page = await ctx.newPage();
const urls = ['https://home.cdbd.in/', 'https://home.cdbd.in/invitation'];
const out = {};
for (const u of urls) {
  try {
    await page.goto(u, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);
    const data = await page.evaluate(() => {
      const txt = document.body.innerText;
      const links = [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h && !h.startsWith('#'));
      const uniq = [...new Set(links)];
      return { txt, links: uniq };
    });
    out[u] = data;
  } catch(e){ out[u] = { error: String(e) }; }
}
await browser.close();
console.log(JSON.stringify(out));
