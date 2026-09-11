// invitation/seminar viewer — 430px viewport, ar 0.4643 매칭 캡처
import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const VIEWER_URL = process.argv[2] || 'https://www.cdbd.in/templates/invitation/seminar/viewer';
const PREFIX = process.argv[3] || 'seminar430';
const VIEWPORT_W = 430;
const VIEWPORT_H = Math.round(430 / 0.4643); // 926

const OUT_DIR = resolve('./screenshots/usecase03');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  locale: 'ko-KR',
  deviceScaleFactor: 3,
});
const page = await context.newPage();

console.log('▶', VIEWER_URL, `${VIEWPORT_W}x${VIEWPORT_H}`);
await page.goto(VIEWER_URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(4000);

const pageHeight = await page.evaluate(async () => {
  let lastH = 0, stable = 0;
  while (stable < 3) {
    const h = document.body.scrollHeight;
    if (h === lastH) stable++; else { stable = 0; lastH = h; }
    for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
    await new Promise(r => setTimeout(r, 700));
  }
  return document.body.scrollHeight;
});
console.log('   pageHeight =', pageHeight);

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT_DIR, `${PREFIX}-fullpage.png`), fullPage: true });

// 텍스트 랜드마크 위치 수집
const landmarks = await page.evaluate(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = (n.textContent || '').trim();
    if (!t || t.length < 2 || t.length > 40) continue;
    let el = n.parentElement;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    out.push({ t, y: Math.round(r.top + window.scrollY) });
  }
  return out;
});
writeFileSync(join(OUT_DIR, `${PREFIX}-landmarks.json`), JSON.stringify(landmarks, null, 2));

// 균등 슬라이스 캡처 (겹침 없이 순차)
const step = VIEWPORT_H;
const shots = [];
for (let i = 0, y = 0; y < pageHeight && i < 12; i++, y += step) {
  const yy = Math.min(y, Math.max(0, pageHeight - VIEWPORT_H));
  await page.evaluate(p => window.scrollTo(0, p), yy);
  await page.waitForTimeout(1000);
  const f = join(OUT_DIR, `${PREFIX}-s${String(i).padStart(2,'0')}.png`);
  await page.screenshot({ path: f, clip: { x: 0, y: 0, width: VIEWPORT_W, height: VIEWPORT_H } });
  shots.push({ i, y: yy, f });
  console.log('   📸', i, 'y=', yy);
}
writeFileSync(join(OUT_DIR, `${PREFIX}-meta.json`), JSON.stringify({ pageHeight, VIEWPORT_W, VIEWPORT_H, shots }, null, 2));
await browser.close();
console.log('✅ done', OUT_DIR);
