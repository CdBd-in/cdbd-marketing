// Step 1: 대시보드 + 에디터 한 페이지 정확 캡처 + UI 텍스트 추출
// — 캡처 품질 ↑ (hydration 대기), DOM 텍스트도 같이 JSON 저장
// 사용법: node step1-editor-discovery.mjs

import { chromium } from 'playwright';
import 'dotenv/config';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const EMAIL = process.env.CDBD_EMAIL;
const PASSWORD = process.env.CDBD_PASSWORD;
const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = parseInt(process.env.SLOW_MO || '0', 10);
const OUT_DIR = resolve(process.env.CAPTURE_OUTPUT_DIR || './screenshots');

if (!EMAIL || !PASSWORD || EMAIL.startsWith('your-')) {
  console.error('❌ .env 파일에 CDBD_EMAIL, CDBD_PASSWORD 를 채워주세요.');
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'ko-KR',
});
const page = await context.newPage();

const uiTextLog = { dashboard: {}, editor: {} };

/**
 * 페이지의 모든 visible 텍스트를 의미있는 단위로 추출
 * — 버튼/메뉴/탭/탑바 등의 UI 텍스트만 (일반 컨텐츠 제외)
 */
async function extractUITexts(page) {
  return await page.evaluate(() => {
    const result = { buttons: [], links: [], headings: [], tabs: [], navItems: [] };

    // 버튼
    document.querySelectorAll('button, [role="button"]').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 50 && text.length > 0) result.buttons.push(text);
    });
    // 링크
    document.querySelectorAll('a').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 50 && text.length > 0) result.links.push(text);
    });
    // 헤딩
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 80) result.headings.push(text);
    });
    // 탭
    document.querySelectorAll('[role="tab"]').forEach(el => {
      const text = el.innerText?.trim();
      if (text) result.tabs.push(text);
    });
    // 네비게이션
    document.querySelectorAll('nav a, nav button, [role="navigation"] a').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length < 50) result.navItems.push(text);
    });

    // 중복 제거
    for (const k of Object.keys(result)) {
      result[k] = [...new Set(result[k])];
    }
    return result;
  });
}

async function safeWait(page, ms = 1500) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

try {
  // ========================================
  // 1. 로그인
  // ========================================
  console.log('▶ 1) 로그인');
  await page.goto('https://www.cdbd.in/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/이메일.*입력/).fill(EMAIL);
  await page.getByPlaceholder(/비밀번호.*입력/).fill(PASSWORD);
  await page.getByRole('button', { name: '로그인하기', exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 });
  console.log(`   ✅ 로그인 성공`);

  // ========================================
  // 2. 대시보드 (내 페이지) — hydration 충분히 대기 후 캡처
  // ========================================
  console.log('▶ 2) 대시보드 진입 + 캡처');
  await page.goto('https://www.cdbd.in/editor', { waitUntil: 'networkidle' });
  // 페이지 카드가 적어도 1개 렌더링 될 때까지 대기 (페이지가 있을 경우)
  await page.locator('text=새 페이지').first().waitFor({ timeout: 10000 }).catch(() => {});
  await safeWait(page, 2000);

  await page.screenshot({ path: join(OUT_DIR, 'dashboard-full.png'), fullPage: true });
  await page.screenshot({ path: join(OUT_DIR, 'dashboard-viewport.png'), fullPage: false });
  uiTextLog.dashboard = await extractUITexts(page);
  uiTextLog.dashboard.url = page.url();
  uiTextLog.dashboard.title = await page.title();
  console.log(`   ✅ 대시보드 캡처 완료 (URL: ${page.url()})`);

  // ========================================
  // 3. 첫 페이지 카드 hover → "수정하기" 클릭 → 에디터 진입
  // ========================================
  console.log('▶ 3) 첫 페이지 카드 hover → "수정하기" 버튼 클릭');

  // 카드 컨테이너 — "새로운 페이지" + "수정됨" 둘 다 들어있는 div 가 카드
  const cardContainer = page.locator('div').filter({
    has: page.getByText('새로운 페이지', { exact: false }),
  }).filter({
    has: page.getByText(/수정됨/),
  }).first();

  const cardCount = await cardContainer.count();
  console.log(`   카드 컨테이너 발견: ${cardCount}개 (첫 번째 사용)`);

  if (cardCount === 0) {
    throw new Error('페이지 카드를 찾을 수 없음 — DOM 구조 확인 필요');
  }

  // 1) 카드 전체에 마우스 호버 (텍스트가 아닌 카드 박스 중심)
  await cardContainer.hover();
  console.log(`   hover 완료, "수정하기" 버튼 등장 대기...`);
  await page.waitForTimeout(1500);

  // 2) 카드 scope 안의 "수정하기" 버튼만 찾기
  const editButton = cardContainer.getByRole('button', { name: '수정하기', exact: true });
  const editCount = await editButton.count();
  console.log(`   카드 내부 "수정하기" 버튼: ${editCount}개`);

  // 3) 클릭 — 새 탭 열릴 가능성 대비 popup waiter 같이
  const popupPromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);
  await editButton.click();
  const newPage = await popupPromise;

  let targetPage = page;
  if (newPage) {
    console.log(`   🆕 새 탭에서 에디터 열림: ${newPage.url()}`);
    targetPage = newPage;
    await targetPage.waitForLoadState('networkidle').catch(() => {});
  } else {
    // 같은 탭에서 URL 변경 기다리기
    await page.waitForURL((u) => u.pathname !== '/editor', { timeout: 15000 })
      .catch(() => console.log('   ⚠️ URL 변경 안 감지'));
  }

  await targetPage.waitForTimeout(4000);  // hydration
  console.log(`   에디터 URL: ${targetPage.url()}`);
  // 이후 캡처 대상도 targetPage 로 교체

  await targetPage.screenshot({ path: join(OUT_DIR, 'editor-full.png'), fullPage: true });
  await targetPage.screenshot({ path: join(OUT_DIR, 'editor-viewport.png'), fullPage: false });
  uiTextLog.editor = await extractUITexts(targetPage);
  uiTextLog.editor.url = targetPage.url();
  uiTextLog.editor.title = await targetPage.title();
  console.log(`   ✅ 에디터 캡처 완료`);

  // ========================================
  // 4. UI 텍스트 JSON 저장
  // ========================================
  const jsonPath = join(OUT_DIR, 'ui-texts.json');
  writeFileSync(jsonPath, JSON.stringify(uiTextLog, null, 2), 'utf-8');
  console.log(`\n📝 UI 텍스트 저장: ${jsonPath}`);

  // 요약 출력
  console.log('\n=== 대시보드 UI 텍스트 요약 ===');
  console.log(`  버튼: [${uiTextLog.dashboard.buttons.slice(0, 8).join(', ')}${uiTextLog.dashboard.buttons.length > 8 ? '...' : ''}]`);
  console.log(`  헤딩: [${uiTextLog.dashboard.headings.slice(0, 5).join(', ')}]`);
  console.log(`  탭: [${uiTextLog.dashboard.tabs.join(', ')}]`);
  console.log(`  네비: [${uiTextLog.dashboard.navItems.slice(0, 8).join(', ')}]`);

  console.log('\n=== 에디터 UI 텍스트 요약 ===');
  console.log(`  버튼: [${uiTextLog.editor.buttons.slice(0, 12).join(', ')}${uiTextLog.editor.buttons.length > 12 ? '...' : ''}]`);
  console.log(`  헤딩: [${uiTextLog.editor.headings.slice(0, 5).join(', ')}]`);
  console.log(`  탭: [${uiTextLog.editor.tabs.join(', ')}]`);

  console.log('\n🎉 Step 1 완료!');
  console.log(`   📂 캡처: ${OUT_DIR}/`);
  console.log(`   📋 메타: ui-texts.json`);
} catch (err) {
  console.error('❌ 에러:', err.message);
  await page.screenshot({ path: join(OUT_DIR, 'step1-error.png'), fullPage: true }).catch(() => {});
  process.exit(1);
} finally {
  await browser.close();
}
