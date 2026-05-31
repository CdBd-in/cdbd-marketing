// Step 4: 통계 페이지 사이드바 4종 + admin/settings/QR 탐색
// 사이드바: 페이지뷰&클릭 / 제출된 답변 / 예약 현황 / 구독 현황
// 추가 탐색: 우상단 프로필/설정 메뉴 → 팀 공유, QR 등
//
// 실행: node step4-stats-sidebar-and-admin.mjs

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

async function clickSidebarAndCapture(p, menuName, fileBase) {
  try {
    await p.getByText(menuName, { exact: true }).first().click();
    await p.waitForTimeout(2500);
    await p.screenshot({ path: join(OUT_DIR, `${fileBase}-full.png`), fullPage: true });
    const ui = await extractUITexts(p);
    ui.url = p.url();
    console.log(`   ✅ "${menuName}" 캡처`);
    return ui;
  } catch (err) {
    console.log(`   ⚠️ "${menuName}" 실패: ${err.message.slice(0, 100)}`);
    return { error: err.message };
  }
}

try {
  console.log('▶ 1) 로그인 + 대시보드');
  await loginAndEnterEditor(page, context);

  // ========================================
  // 2. 통계 페이지 직접 진입 (URL 직접 — 알고 있음)
  // ========================================
  console.log('▶ 2) 통계 페이지 직접 진입');
  await page.goto('https://www.cdbd.in/stats/3030/view', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log(`   URL: ${page.url()}`);

  // 통계 사이드바 메뉴 4개 차례로 클릭 + 캡처
  // (이미 step3에서 "페이지뷰 & 클릭"은 캡처함 — 다시 한 번 + 나머지 3개)
  log.statsSidebar = {};
  log.statsSidebar['페이지뷰 & 클릭'] = await clickSidebarAndCapture(page, '페이지뷰 & 클릭', 'stats-pageview');
  log.statsSidebar['제출된 답변'] = await clickSidebarAndCapture(page, '제출된 답변', 'stats-submissions');
  log.statsSidebar['예약 현황'] = await clickSidebarAndCapture(page, '예약 현황', 'stats-reservations');
  log.statsSidebar['구독 현황'] = await clickSidebarAndCapture(page, '구독 현황', 'stats-subscriptions');

  // ========================================
  // 3. 우상단 프로필/설정 메뉴 탐색
  // ========================================
  console.log('\n▶ 3) 대시보드로 가서 우상단 프로필/설정 메뉴 탐색');
  await page.goto('https://www.cdbd.in/editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 우상단 모든 클릭 가능한 버튼/아바타 캡처 시도
  // 화면 우상단에 사용자 프로필 아이콘이 있을 가능성
  await page.screenshot({ path: join(OUT_DIR, 'dashboard-topright.png'), fullPage: false });

  // 우상단 아이콘 검색 — 사용자 프로필 아바타·메뉴 등
  const topRightButtons = await page.evaluate(() => {
    // viewport 우상단 영역의 클릭 가능한 element들
    const all = document.querySelectorAll('button, [role="button"], [aria-label]');
    const result = [];
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      // 우상단 영역 (x > 1200, y < 150)
      if (rect.x > 1100 && rect.y < 150 && rect.x < 1440 && rect.width > 0) {
        result.push({
          text: el.innerText?.trim().slice(0, 50) || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          tag: el.tagName,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        });
      }
    }
    return result;
  });
  log.topRightButtons = topRightButtons;
  console.log(`   우상단 버튼: ${topRightButtons.length}개`);
  topRightButtons.forEach(b => console.log(`     - "${b.text || b.ariaLabel}" (${b.tag} @${b.x},${b.y})`));

  // ========================================
  // 4. 메타 저장
  // ========================================
  const jsonPath = join(OUT_DIR, 'step4-ui-texts.json');
  writeFileSync(jsonPath, JSON.stringify(log, null, 2), 'utf-8');
  console.log(`\n📝 메타데이터: ${jsonPath}`);
  console.log('\n🎉 Step 4 완료!');
} catch (err) {
  console.error('❌ 에러:', err.message);
  await page.screenshot({ path: join(OUT_DIR, 'step4-error.png'), fullPage: true }).catch(() => {});
  process.exit(1);
} finally {
  await browser.close();
}
