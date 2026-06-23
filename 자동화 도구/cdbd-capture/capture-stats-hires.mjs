// 통계 페이지 고해상도(DSF2) 요소 클립 캡처 — 통계요약 카드 + 클릭요약 카드 (페이지명 헤더 제외)
import { chromium } from 'playwright';
import 'dotenv/config';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { loginAndEnterEditor } from './lib/cdbd-auth.mjs';

const OUT = resolve('./screenshots/catalog'); if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, locale: 'ko-KR' });
const page = await context.newPage();

await loginAndEnterEditor(page, context);
console.error('로그인 OK');

// 통계 페이지로 직접 이동 (page id 3030)
await page.goto('https://www.cdbd.in/stats/3030/view', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
let sp = page;
await sp.waitForTimeout(4000);
console.error('통계 URL:', sp.url());

// 빨간 선택박스 제거 시도: 다른 지표(클릭수) 클릭했다가 페이지뷰 다시 — 또는 그냥 둠. 여기선 그대로 캡처.
async function clipCard(label, headingText, mustInclude) {
  const box = await sp.evaluate(({ headingText, mustInclude }) => {
    const els = [...document.querySelectorAll('*')];
    const h = els.find(e => e.children.length === 0 && e.textContent.trim() === headingText);
    if (!h) return null;
    let c = h;
    while (c && !mustInclude.every(t => c.textContent.includes(t))) c = c.parentElement;
    if (!c) c = h.parentElement;
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, { headingText, mustInclude });
  if (!box) { console.error(label, 'NOT FOUND'); return; }
  const pad = 8;
  await sp.screenshot({ path: join(OUT, `${label}.png`), clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 } });
  console.error(label, '->', JSON.stringify(box));
}
await clipCard('stat-card-hi', '통계 요약', ['페이지뷰', '클릭률']);
await clipCard('click-summary-hi', '클릭 요약', ['TOP', '링크']);
await sp.screenshot({ path: join(OUT, 'stats-full-hi.png'), fullPage: true });
await browser.close();
console.log('done');
