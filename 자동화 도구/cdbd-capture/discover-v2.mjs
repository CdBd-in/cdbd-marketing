import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: 'ko-KR' });
const page = await ctx.newPage();

// 1) get category page URLs from the 3 "전체 보기" buttons
await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);
const nBtns = (await page.getByRole('button', { name: /전체 보기/ }).all()).length;
console.log('전체보기 buttons:', nBtns);
const catUrls = [];
for (let i = 0; i < nBtns; i++) {
  await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const btns = await page.getByRole('button', { name: /전체 보기/ }).all();
  const b = btns[i];
  await b.scrollIntoViewIfNeeded();
  await Promise.all([ page.waitForURL(/\/templates\/.+/, { timeout: 15000 }), b.click({ timeout: 5000 }) ]);
  await page.waitForTimeout(1500);
  catUrls.push(page.url());
  console.log('  category', i, '->', page.url());
}

// 2) on each category page, collect all cards and click each for detail URL
const results = [];
for (const catUrl of catUrls) {
  await page.goto(catUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(async () => { await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,800);y+=800;if(y>=document.body.scrollHeight){clearInterval(t);r();}},80);}); });
  await page.waitForTimeout(1200);
  const cards = await page.evaluate(() => {
    const out=[]; const seen=new Set();
    for (const el of Array.from(document.querySelectorAll('button'))) {
      const t=(el.textContent||'').trim();
      if (/^(원페이지|멀티페이지)/.test(t) && t.length>12) {
        const type=t.startsWith('멀티페이지')?'multi':'single';
        const desc=t.replace(/^(원페이지|멀티페이지)/,'').trim();
        if(!seen.has(desc)){seen.add(desc);out.push({type,desc});}
      }
    }
    return out;
  });
  console.log('category', catUrl, '-> cards', cards.length);
  for (const c of cards) {
    try {
      await page.goto(catUrl, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2200);
      const btn = page.locator('button').filter({ hasText: c.desc }).first();
      await btn.scrollIntoViewIfNeeded();
      await Promise.all([ page.waitForURL(/\/templates\/.+/, { timeout: 15000 }), btn.click({ timeout: 5000 }) ]);
      await page.waitForTimeout(1200);
      const url = page.url();
      const slug = url.replace(/^https?:\/\/[^/]+\/templates\//,'').replace(/\/$/,'');
      if (!results.find(r=>r.slug===slug)) { results.push({ ...c, catUrl, url, slug }); console.log(`  ✓ ${c.type} | ${slug}`); }
    } catch(e){ console.log(`  ✗ ${c.desc.slice(0,24)} — ${e.message.split('\n')[0]}`); }
  }
}

writeFileSync('templates-list.json', JSON.stringify(results, null, 2));
console.log('\nTOTAL templates:', results.length);
await browser.close();
