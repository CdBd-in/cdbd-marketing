// Step 3: 대시보드 카드 → "통계보기" 클릭 → 통계 페이지 캡처
//        + 사이드바 다른 메뉴 탐색 (저장한 페이지 / 초대받은 페이지)
//
// 실행: node step3-stats-admin.mjs

import { chromium } from 'playwright';
import 'dotenv/config';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { loginAndEnterEditor, extractUITexts } from './lib/cdbd-auth.mjs';

const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = parseInt(process.env.SLOW_MO || '0', 10);
const OUT_DIR = resolve(process.env.CAPTURE_OUTPUT_DIR || './screenshots');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'ko-KR',
});
const page = await context.newPage();

const log = {};

try {
  console.log('▶ 1) 로그인 + 대시보드');
  await loginAndEnterEditor(page, context);

  // ========================================
  // 2. 첫 페이지 카드 hover → "통계보기" 클릭
  // ========================================
  console.log('▶ 2) 첫 페이지 카드 hover → "통계보기" 클릭');

  const cardContainer = page.locator('div').filter({
    has: page.getByText('새로운 페이지', { exact: false }),
  }).filter({
    has: page.getByText(/수정됨/),
  }).first();

  await cardContainer.hover();
  await page.waitForTimeout(1200);

  // "통계보기" 버튼 — 새 탭에서 열릴 수도, 같은 탭에서 navigation 일어날 수도
  const statsBtn = cardContainer.getByRole('button', { name: '통계보기', exact: true });
  const popupPromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);
  await statsBtn.click();
  const newPage = await popupPromise;

  let statsPage = page;
  if (newPage) {
    console.log(`   🆕 새 탭에서 열림: ${newPage.url()}`);
    statsPage = newPage;
    await statsPage.waitForLoadState('networkidle').catch(() => {});
  } else {
    await page.waitForURL((u) => u.pathname !== '/editor', { timeout: 15000 })
      .catch(() => console.log('   ⚠️ URL 변경 안 됨'));
  }
  await statsPage.waitForTimeout(4000);
  console.log(`   통계 페이지 URL: ${statsPage.url()}`);

  await statsPage.screenshot({ path: join(OUT_DIR, 'stats-full.png'), fullPage: true });
  await statsPage.screenshot({ path: join(OUT_DIR, 'stats-viewport.png'), fullPage: false });
  log.stats = await extractUITexts(statsPage);
  log.stats.url = statsPage.url();
  log.stats.title = await statsPage.title();
  console.log(`   ✅ 통계 페이지 캡처 완료`);
  console.log(`   버튼들: [${log.stats.buttons.slice(0, 15).join(', ')}]`);
  console.log(`   헤딩: [${log.stats.headings.slice(0, 8).join(', ')}]`);

  // ========================================
  // 3. 대시보드의 다른 사이드바 메뉴 탐색
  // ========================================
  console.log('\n▶ 3) "저장한 페이지" / "초대받은 페이지" 사이드바 탐색');

  // 통계 페이지에서 새 탭이면 닫고, 같은 탭이면 뒤로
  if (newPage) {
    await newPage.close();
  } else {
    await page.goBack();
    await page.waitForTimeout(2000);
  }

  // 대시보드 다시 (페이지가 변경됐을 수 있음)
  await page.goto('https://www.cdbd.in/editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // "저장한 페이지" 클릭
  try {
    await page.getByText('저장한 페이지', { exact: true }).first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(OUT_DIR, 'sidebar-saved-pages.png'), fullPage: true });
    log.savedPages = await extractUITexts(page);
    log.savedPages.url = page.url();
    console.log(`   ✅ "저장한 페이지" 캡처`);
  } catch (err) {
    console.log(`   ⚠️ "저장한 페이지" 실패: ${err.message}`);
  }

  // "초대받은 페이지" 클릭
  try {
    await page.getByText('초대받은 페이지', { exact: true }).first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(OUT_DIR, 'sidebar-invited-pages.png'), fullPage: true });
    log.invitedPages = await extractUITexts(page);
    log.invitedPages.url = page.url();
    console.log(`   ✅ "초대받은 페이지" 캡처`);
  } catch (err) {
    console.log(`   ⚠️ "초대받은 페이지" 실패: ${err.message}`);
  }

  // ========================================
  // 4. 메타 저장
  // ========================================
  const jsonPath = join(OUT_DIR, 'step3-ui-texts.json');
  writeFileSync(jsonPath, JSON.stringify(log, null, 2), 'utf-8');
  console.log(`\n📝 메타데이터: ${jsonPath}`);
  console.log('\n🎉 Step 3 완료!');
} catch (err) {
  console.error('❌ 에러:', err.message);
  await page.screenshot({ path: join(OUT_DIR, 'step3-error.png'), fullPage: true }).catch(() => {});
  process.exit(1);
} finally {
  await browser.close();
}
