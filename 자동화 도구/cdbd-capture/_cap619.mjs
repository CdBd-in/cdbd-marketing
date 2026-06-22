import { chromium } from 'playwright';
const slugs = ['lookbook','newarrival','oak_table'];
const VW=390, VH=630;
const browser = await chromium.launch();
for (const slug of slugs) {
  const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  try { await p.goto(`https://www.cdbd.in/templates/catalog/${slug}/viewer`, { waitUntil:'networkidle', timeout:45000 }); } catch(e){}
  await p.waitForTimeout(6000);
  await p.evaluate(()=>window.scrollTo(0,0));
  await p.waitForTimeout(1500);
  await p.screenshot({ path:`/tmp/cap619-${slug}.png` });
  await ctx.close();
  console.log('done', slug);
}
await browser.close();
