import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: 'ko-KR' });
const page = await ctx.newPage();

async function expandAll() {
  for (let k = 0; k < 8; k++) {
    const btns = await page.getByRole('button', { name: /전체 보기/ }).all();
    let clicked = false;
    for (const b of btns) {
      try { if (await b.isVisible()) { await b.scrollIntoViewIfNeeded(); await b.click({ timeout: 2500 }); await page.waitForTimeout(600); clicked = true; } } catch {}
    }
    if (!clicked) break;
  }
}

await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);
await expandAll();
await page.waitForTimeout(1000);

// collect card descriptions
const cards = await page.evaluate(() => {
  const out = [];
  for (const el of Array.from(document.querySelectorAll('button'))) {
    const t = (el.textContent||'').trim();
    if (/^(원페이지|멀티페이지)/.test(t) && t.length > 12) {
      const type = t.startsWith('멀티페이지') ? 'multi' : 'single';
      const desc = t.replace(/^(원페이지|멀티페이지)/, '').trim();
      out.push({ type, desc });
    }
  }
  // dedupe by desc
  const seen = new Set(); return out.filter(c => !seen.has(c.desc) && seen.add(c.desc));
});
console.log('CARDS FOUND:', cards.length);

// For each card, click to discover detail URL
const results = [];
for (const c of cards) {
  try {
    await page.goto('https://www.cdbd.in/templates', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    await expandAll();
    await page.waitForTimeout(500);
    const btn = page.locator('button').filter({ hasText: c.desc }).first();
    await btn.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/templates\/.+/, { timeout: 15000 }),
      btn.click({ timeout: 5000 }),
    ]);
    await page.waitForTimeout(1500);
    const url = page.url();
    const slug = url.replace(/^https?:\/\/[^/]+\/templates\//, '').replace(/\/$/, '');
    results.push({ ...c, url, slug });
    console.log(`✓ ${c.type} | ${slug} | ${c.desc.slice(0,30)}`);
  } catch (e) {
    results.push({ ...c, url: null, error: e.message.split('\n')[0] });
    console.log(`✗ ${c.desc.slice(0,30)} — ${e.message.split('\n')[0]}`);
  }
}

writeFileSync('templates-list.json', JSON.stringify(results, null, 2));
console.log('\nSaved templates-list.json with', results.length, 'entries');
console.log('with URL:', results.filter(r=>r.url).length);
await browser.close();
