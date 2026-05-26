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
  // 3. 첫 페이지 카드 클릭 → 에디터 진입
  // ========================================
  console.log('▶ 3) 첫 페이지 카드 클릭 → 에디터 진입');
  // 페이지 카드를 가장 안전하게 찾기 — "새로운 페이지" 텍스트 또는 카드 클릭
  const firstCard = page.locator('text=새로운 페이지').first();
  const hasCards = await firstCard.count() > 0;

  if (!hasCards) {
    console.log('   ⚠️ 페이지 카드가 없어 보임. 새 페이지 만들기 시도');
    await page.getByRole('button', { name: /새 페이지/ }).first().click();
  } else {
    await firstCard.click();
  }

  // 에디터로 진입 — URL 변경 대기
  await page.waitForURL((u) => u.pathname !== '/editor' && u.pathname.includes('editor'), { timeout: 15000 })
    .catch(() => console.log('   ⚠️ URL 변경 안 감지 — 같은 페이지에서 모달 등이 있을 수 있음'));
  await safeWait(page, 3000);
  console.log(`   에디터 URL: ${page.url()}`);

  await page.screenshot({ path: join(OUT_DIR, 'editor-full.png'), fullPage: true });
  await page.screenshot({ path: join(OUT_DIR, 'editor-viewport.png'), fullPage: false });
  uiTextLog.editor = await extractUITexts(page);
  uiTextLog.editor.url = page.url();
  uiTextLog.editor.title = await page.title();
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
