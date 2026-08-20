import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const OUT='screenshots/w32-flow'; mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ headless:true });
const ctx = await b.newContext({ viewport:{width:393,height:781}, deviceScaleFactor:3, locale:'ko-KR', isMobile:true, hasTouch:true });
const p = await ctx.newPage();
await p.goto('https://www.cdbd.in/templates/invitation/prestige/viewer',{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(3000);
// find 예약하기 button
const btn = p.getByText(/^예약하기$/).first();
try {
  await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await p.screenshot({path:`${OUT}/00-before.png`});
  await btn.click({timeout:8000}); await p.waitForTimeout(3000);
  await p.screenshot({path:`${OUT}/01-after-click.png`});
  const txt = (await p.evaluate(()=>document.body.innerText)).slice(0,600);
  console.log('AFTER CLICK TEXT:\n', txt);
  // try selecting a date + time then next
  for (const label of ['11','14:00']) {
    try { const el = p.getByText(new RegExp(`^${label}$`)).first(); await el.click({timeout:4000}); await p.waitForTimeout(1200); } catch(e){ console.log('skip',label,e.message.split('\n')[0]); }
  }
  await p.screenshot({path:`${OUT}/02-selected.png`});
  try { await p.getByText(/^예약하기$/).last().click({timeout:6000}); await p.waitForTimeout(3000); } catch(e){ console.log('submit fail', e.message.split('\n')[0]); }
  await p.screenshot({path:`${OUT}/03-auth.png`});
  console.log('FINAL TEXT:\n', (await p.evaluate(()=>document.body.innerText)).slice(0,600));
} catch(e){ console.log('ERR', e.message.split('\n')[0]); }
await b.close(); console.log('DONE');
