// viewer 페이지의 특정 y 영역만 정밀 크롭 캡처 (폰 화면 비율에 맞춤)
// PIL/sharp 불필요 — Playwright viewport 높이 + 스크롤 조합
//
// 실행: node capture-viewer-crop.mjs <url> <yStartPx> <outName> [cropHeight]
// 예:   node capture-viewer-crop.mjs https://www.cdbd.in/templates/invitation/rsvp/viewer 0 rsvp-hero

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const VIEWER_URL = process.argv[2];
const Y_START = parseInt(process.argv[3] || '0', 10);
const OUT_NAME = process.argv[4] || 'crop';
// 폰 화면 비율 9:19.5 → width 390 → height 845 (한 화면 = 폰 비율)
const CROP_H = parseInt(process.argv[5] || '845', 10);

if (!VIEWER_URL) {
  console.error('사용법: node capture-viewer-crop.mjs <url> <yStartPx> <outName> [cropHeight]');
  process.exit(1);
}

const OUT_DIR = resolve('./screenshots/viewer-crops');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: CROP_H },  // 크롭 높이 = viewport 높이
  locale: 'ko-KR',
  deviceScaleFactor: 2,
});
const page = await context.newPage();

try {
  console.log(`▶ ${VIEWER_URL}`);
  console.log(`   크롭 영역: y=${Y_START} ~ ${Y_START + CROP_H} (높이 ${CROP_H}px)`);
  await page.goto(VIEWER_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // 해당 y로 스크롤 (lazy-load 이미지 로딩 위해 끝까지 한 번 스크롤 후 복귀)
  const pageH = await page.evaluate(() => document.body.scrollHeight);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page.evaluate(y => window.scrollTo(0, y), Y_START);
  await page.waitForTimeout(1200);

  const outPath = join(OUT_DIR, `${OUT_NAME}.png`);
  await page.screenshot({ path: outPath });
  console.log(`   ✅ 저장: ${outPath} (페이지 전체 높이 ${pageH}px)`);
} catch (err) {
  console.error('❌ 에러:', err.message);
  process.exit(1);
} finally {
  await browser.close();
}
