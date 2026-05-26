// Step 2-b: 예약 카드 다이얼로그 통과 + 2단 카드 (텍스트+이미지) 보완 캡처
//
// 실행: node step2b-reservation-and-2col.mjs

import { chromium } from 'playwright';
import 'dotenv/config';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { loginAndEnterEditor, enterFirstPageEditor, extractUITexts } from './lib/cdbd-auth.mjs';

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

const log = { capture: {} };

async function openCardModal(editor) {
  await editor.locator('text=카드 추가하기').first().click({ force: true });
  await editor.waitForTimeout(2000);
}

async function addCardByName(editor, name) {
  // 모달 안에서 정확한 카드명 클릭
  await editor.getByText(name, { exact: true }).first().click({ force: true });
  await editor.waitForTimeout(2000);
}

try {
  console.log('▶ 1) 로그인 + 에디터 진입');
  await loginAndEnterEditor(page, context);
  const editor = await enterFirstPageEditor(page, context);
  console.log(`   에디터 URL: ${editor.url()}`);

  // ========================================
  // 2. 2단 카드 → 텍스트 + 이미지
  // ========================================
  console.log('\n▶ 2) 2단 카드 "텍스트 + 이미지" 추가');
  await openCardModal(editor);
  await addCardByName(editor, '텍스트 + 이미지');
  await editor.screenshot({ path: join(OUT_DIR, 'card-2col-텍스트_이미지-full.png'), fullPage: true });
  log.capture['텍스트 + 이미지'] = {
    file: 'card-2col-텍스트_이미지-full.png',
    type: '2단 카드',
    status: 'captured',
  };
  console.log(`   ✅ "텍스트 + 이미지" 캡처 완료`);

  // ========================================
  // 3. 예약 카드 — 다이얼로그 통과 → 실제 카드 패널 캡처
  // ========================================
  console.log('\n▶ 3) 예약 카드 추가 (유료 다이얼로그 확인)');
  await openCardModal(editor);
  await editor.getByText('예약', { exact: true }).first().click({ force: true });
  await editor.waitForTimeout(2000);  // 다이얼로그 등장 대기

  // 다이얼로그 캡처 (사전 확인용)
  await editor.screenshot({ path: join(OUT_DIR, 'card-예약-dialog.png'), fullPage: false });
  console.log(`   📋 다이얼로그 캡처 완료`);

  // 다이얼로그 안 보라 "카드 추가하기" 버튼 — Enter 키로 primary 액션 트리거
  // (다이얼로그가 visible 상태에서 Enter는 primary button 클릭과 동일)
  await editor.keyboard.press('Enter');
  await editor.waitForTimeout(3000); // 카드 추가 + 패널 렌더링

  // 만약 모달이 아직 열려있으면 ESC로 닫기
  const modalVisible = await editor.locator('text=카드 추가하기').filter({ hasNot: editor.locator('text=새로운 페이지') }).first().isVisible().catch(() => false);
  if (modalVisible) {
    await editor.keyboard.press('Escape');
    await editor.waitForTimeout(1500);
  }

  await editor.screenshot({ path: join(OUT_DIR, 'card-예약-panel-full.png'), fullPage: true });
  log.capture['예약'] = {
    file: 'card-예약-panel-full.png',
    type: '기본 카드 (유료)',
    status: 'captured_after_dialog',
    dialogFile: 'card-예약-dialog.png',
    note: '예약 완료 1건 당 1크레딧 차감 — 다이얼로그 확인 후 추가됨',
  };
  console.log(`   ✅ 예약 카드 패널 캡처 완료`);

  // ========================================
  // 4. UI 텍스트 메타 저장
  // ========================================
  log.editorUITexts = await extractUITexts(editor);
  const jsonPath = join(OUT_DIR, 'step2b-ui-texts.json');
  writeFileSync(jsonPath, JSON.stringify(log, null, 2), 'utf-8');
  console.log(`\n📝 메타데이터: ${jsonPath}`);

  console.log('\n🎉 Step 2-b 완료!');
} catch (err) {
  console.error('❌ 에러:', err.message);
  await page.screenshot({ path: join(OUT_DIR, 'step2b-error.png'), fullPage: true }).catch(() => {});
  process.exit(1);
} finally {
  await browser.close();
}
