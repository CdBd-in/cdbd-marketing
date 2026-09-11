import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const SLUGS = ['invitation/prestige','invitation/event-ticket','invitation/gala-rsvp','invitation/church-rsvp'];
const OUT = 'screenshots/w32-invite';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 781 },
  deviceScaleFactor: 3, locale: 'ko-KR', isMobile: true, hasTouch: true
});
const page = await ctx.newPage();

for (const slug of SLUGS) {
  const name = slug.replace('/', '__');
  const url = `https://www.cdbd.in/templates/${slug}/viewer`;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3500);
    // slow full scroll to trigger lazy load
    await page.evaluate(async () => {
      await new Promise(r => { let y=0; const t=setInterval(()=>{ window.scrollBy(0,400); y+=400; if (y>=document.body.scrollHeight+800){clearInterval(t);r();} }, 90); });
    });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(1200);
    const h = await page.evaluate(() => document.body.scrollHeight);
    // viewport-sized sequential captures (fit phone screen aspect)
    const n = Math.min(4, Math.max(1, Math.ceil(h/781)));
    for (let i=0;i<n;i++){
      await page.evaluate(y => window.scrollTo(0,y), i*781);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${OUT}/${name}-p${i+1}.png` });
    }
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
    console.log(`OK ${slug} h=${h} shots=${n}`);
  } catch (e) { console.log(`FAIL ${slug} — ${e.message.split('\n')[0]}`); }
}
await browser.close();
console.log('DONE');
