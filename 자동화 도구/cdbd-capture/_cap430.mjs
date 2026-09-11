import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [412, 430, 448]) {
  const p = await b.newPage({ viewport:{width:w,height:Math.round(w*2.1487)}, deviceScaleFactor:2 });
  await p.goto('https://www.cdbd.in/templates/invitation/prestige/viewer', {waitUntil:'networkidle', timeout:90000});
  await p.waitForTimeout(3000);
  await p.screenshot({ path:`/tmp/prestige-${w}.png` });
  await p.close();
  console.log('captured', w);
}
await b.close();
