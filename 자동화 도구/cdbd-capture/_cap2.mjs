import { chromium } from 'playwright';
const slugs = ['lookbook','oak_table'];
const VW=390, VH=630;
const browser = await chromium.launch();
for (const slug of slugs) {
  const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  try { await p.goto(`https://www.cdbd.in/templates/catalog/${slug}/viewer`, { waitUntil:'domcontentloaded', timeout:60000 }); } catch(e){ console.log('goto err', slug, e.message); }
  await p.waitForTimeout(12000);
  try { await p.mouse.move(195,300); await p.mouse.wheel(0,200); await p.waitForTimeout(800); await p.evaluate(()=>window.scrollTo(0,0)); } catch(e){}
  await p.waitForTimeout(2000);
  await p.screenshot({ path:`/tmp/cap619-${slug}.png` });
  await ctx.close();
  console.log('done', slug);
}
await browser.close();
