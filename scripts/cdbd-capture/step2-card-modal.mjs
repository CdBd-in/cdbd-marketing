// Step 2: "카드 추가하기" 모달 + 중요 카드 4종 캡처
// 갤러리 / 질문과 답변 / 예약 / 2단 카드
//
// 실행: node step2-card-modal.mjs

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

const log = { modal: {}, cards: {} };

try {
  console.log('▶ 1) 로그인 + 대시보드');
  await loginAndEnterEditor(page, context);

  console.log('▶ 2) 첫 페이지 에디터 진입');
  const editor = await enterFirstPageEditor(page, context);
  console.log(`   에디터 URL: ${editor.url()}`);

  // ========================================
  // 3. "카드 추가하기" 클릭 → 모달 캡처
  // ========================================
  console.log('▶ 3) "카드 추가하기" 클릭');
  await editor.getByRole('button', { name: '카드 추가하기', exact: true }).first().click();
  await editor.waitForTimeout(2000); // 모달 렌더링 대기

  await editor.screenshot({ path: join(OUT_DIR, 'card-add-modal-full.png'), fullPage: true });
  await editor.screenshot({ path: join(OUT_DIR, 'card-add-modal-viewport.png'), fullPage: false });
  log.modal = await extractUITexts(editor);
  console.log(`   ✅ 모달 캡처 완료`);
  console.log(`   모달 버튼들: [${log.modal.buttons.slice(0, 20).join(', ')}]`);
  console.log(`   모달 헤딩: [${log.modal.headings.join(', ')}]`);

  // ========================================
  // 4. 중요 카드 4종 캡처
  //    갤러리 / 질문과 답변 / 예약 / 2단 카드
  // ========================================
  const importantCards = ['갤러리', '질문과 답변', '예약', '2단 카드', '2단카드'];

  // 모달 안에서 각 카드를 클릭 가능한지 확인 + 캡처
  console.log('\n▶ 4) 중요 카드 종류 캡처 시도');

  // 우선 모달에서 보이는 모든 카드명 추출
  const allCardNames = await editor.evaluate(() => {
    // dialog 또는 modal 안의 텍스트 모두
    const dialogs = document.querySelectorAll('[role="dialog"]');
    const names = [];
    for (const dlg of dialogs) {
      dlg.querySelectorAll('button, [role="button"], .card-item, li').forEach(el => {
        const t = el.innerText?.trim();
        if (t && t.length > 0 && t.length < 50) names.push(t);
      });
    }
    return [...new Set(names)];
  });
  console.log(`   📋 모달에서 발견된 카드/버튼: ${allCardNames.length}개`);
  console.log(`   →  ${allCardNames.join(' / ')}`);
  log.modal.allCardNamesInDialog = allCardNames;

  // 각 중요 카드 시도
  for (const cardName of importantCards) {
    try {
      // 카드 클릭 시도 — exact 또는 partial match
      const candidate = editor.getByText(cardName, { exact: true }).first();
      const exists = await candidate.count() > 0;
      if (!exists) {
        // 부분 매치 시도
        const fallback = editor.locator(`text=${cardName}`).first();
        if (await fallback.count() === 0) {
          console.log(`   ⚠️ "${cardName}" 모달에서 안 보임 — 스킵`);
          log.cards[cardName] = { status: 'not_found' };
          continue;
        }
      }

      console.log(`   ▶ "${cardName}" 클릭 → 추가 후 캡처`);
      await candidate.click({ force: true });
      await editor.waitForTimeout(2500); // 카드 추가 + 렌더링 대기

      const safeName = cardName.replace(/\s+/g, '_');
      await editor.screenshot({ path: join(OUT_DIR, `card-${safeName}-full.png`), fullPage: true });
      log.cards[cardName] = {
        status: 'captured',
        file: `card-${safeName}-full.png`,
        editorURL: editor.url(),
      };
      console.log(`   ✅ "${cardName}" 캡처 완료`);

      // 다시 "카드 추가하기" 누르려면 모달 닫혀있어야 함
      // — 카드는 추가됐고 모달은 자동 닫혔을 것
      await editor.waitForTimeout(500);

      // 다음 카드 위해 모달 다시 열기 (마지막 카드면 안 열어도 됨)
      if (cardName !== importantCards[importantCards.length - 1]) {
        await editor.getByRole('button', { name: '카드 추가하기', exact: true }).first().click();
        await editor.waitForTimeout(1500);
      }
    } catch (err) {
      console.log(`   ❌ "${cardName}" 실패: ${err.message}`);
      log.cards[cardName] = { status: 'error', error: err.message };
    }
  }

  // ========================================
  // 5. UI 텍스트 저장
  // ========================================
  const jsonPath = join(OUT_DIR, 'step2-ui-texts.json');
  writeFileSync(jsonPath, JSON.stringify(log, null, 2), 'utf-8');
  console.log(`\n📝 메타데이터 저장: ${jsonPath}`);

  console.log('\n🎉 Step 2 완료!');
} catch (err) {
  console.error('❌ 에러:', err.message);
  await page.screenshot({ path: join(OUT_DIR, 'step2-error.png'), fullPage: true }).catch(() => {});
  process.exit(1);
} finally {
  await browser.close();
}
