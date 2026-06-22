// Step 5d: 누적된 카드 정리 후 텍스트·이미지·버튼·코드 재캡쳐
// 좌표 기반 click + 모달 내부 카드만 strict 매칭 + 추가 후 카드 삭제

import { chromium } from "playwright";
import "dotenv/config";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import {
  loginAndEnterEditor,
  enterFirstPageEditor,
} from "./lib/cdbd-auth.mjs";

const HEADLESS = process.env.HEADLESS !== "false";
const OUT_DIR = resolve(
  process.env.CAPTURE_OUTPUT_DIR || "./screenshots/step5-cards-and-management"
);
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = ["텍스트", "이미지", "버튼", "코드"];

async function openCardModal(editor) {
  // 1) 카드 추가 버튼 찾기 — DOM에서 좌표 동적 계산
  const btnInfo = await editor.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const b of btns) {
      if ((b.innerText || "").trim() === "카드 추가하기") {
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          return {
            x: r.x + r.width / 2,
            y: r.y + r.height / 2,
            w: r.width,
            h: r.height,
          };
        }
      }
    }
    return null;
  });
  if (!btnInfo) return false;

  // 2) 좌표로 직접 클릭
  await editor.mouse.click(btnInfo.x, btnInfo.y);
  await editor.waitForTimeout(2000);

  // 3) 모달 열렸나 확인
  const dlgCount = await editor.locator('[role="dialog"]').count();
  return dlgCount > 0;
}

async function clickCardInModal(editor, cardName) {
  // 모달 내부 버튼만 정확 매칭
  const dialog = editor.locator('[role="dialog"]').first();

  // exact 텍스트만 (텍스트+텍스트 같은 거 제외하려고)
  const cardBtn = dialog
    .locator(`button`)
    .filter({ hasText: new RegExp(`^${cardName}$`) })
    .first();
  const count = await cardBtn.count();
  if (count === 0) {
    // fallback: div role=button
    const divBtn = dialog
      .locator("[role='button']")
      .filter({ hasText: new RegExp(`^${cardName}$`) })
      .first();
    if ((await divBtn.count()) === 0) return false;
    await divBtn.click({ force: true });
    return true;
  }
  await cardBtn.click({ force: true });
  return true;
}

async function getRightPanelHeader(editor) {
  return await editor.evaluate(() => {
    const vw = window.innerWidth;
    const candidates = [];
    document
      .querySelectorAll("h1, h2, h3, [class*='header'] *, [class*='title'] *")
      .forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.x > vw * 0.6 && r.y < 250) {
          const t = (el.innerText || "").trim();
          if (t && t.length < 30) candidates.push(t);
        }
      });
    return [...new Set(candidates)];
  });
}

async function captureRightPanel(editor, filePath) {
  const vw = editor.viewportSize();
  await editor.screenshot({
    path: filePath,
    clip: {
      x: Math.floor(vw.width * 0.66),
      y: 80,
      width: Math.floor(vw.width * 0.34),
      height: vw.height - 80,
    },
  });
}

async function deleteCard(editor, cardName) {
  // 막 추가한 카드의 메뉴(⋮) 클릭 → 삭제
  // 카드 리스트에서 이름 매칭되는 마지막 행
  try {
    const cardRows = editor.locator(`text=${cardName}`);
    const cnt = await cardRows.count();
    if (cnt === 0) return false;
    const last = cardRows.last();
    // hover로 ⋮ 버튼 노출 (대부분 hover에 표시)
    await last.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
    await last.hover().catch(() => {});
    await editor.waitForTimeout(500);
    // ⋮ 또는 메뉴 버튼 클릭
    const menuBtn = editor
      .getByRole("button", { name: "카드 메뉴" })
      .last();
    await menuBtn.click({ force: true, timeout: 3000 }).catch(() => {});
    await editor.waitForTimeout(800);
    // 삭제 옵션
    const delOpt = editor
      .locator("text=/삭제/")
      .first();
    if ((await delOpt.count()) > 0) {
      await delOpt.click({ force: true, timeout: 3000 });
      await editor.waitForTimeout(1500);
      return true;
    }
  } catch (e) {}
  return false;
}

const browser = await chromium.launch({ headless: HEADLESS });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ko-KR",
});
const page = await context.newPage();
const log = { attempts: {} };

try {
  console.log("▶ 로그인 + 에디터");
  await loginAndEnterEditor(page, context);
  const editor = await enterFirstPageEditor(page, context);

  for (const cardName of TARGETS) {
    console.log(`\n▶ "${cardName}"`);
    const result = { name: cardName };

    // ESC 깨끗하게
    await editor.keyboard.press("Escape").catch(() => {});
    await editor.waitForTimeout(500);

    // 1. 모달 열기
    const modalOpen = await openCardModal(editor);
    if (!modalOpen) {
      result.status = "modal_failed";
      log.attempts[cardName] = result;
      console.log(`   ❌ 모달 열기 실패`);
      continue;
    }
    console.log(`   ✅ 모달 열림`);

    // 2. 카드 클릭
    const clicked = await clickCardInModal(editor, cardName);
    if (!clicked) {
      result.status = "no_match_in_modal";
      await editor.keyboard.press("Escape").catch(() => {});
      log.attempts[cardName] = result;
      console.log(`   ❌ 모달에서 매칭 실패`);
      continue;
    }
    await editor.waitForTimeout(3000);
    console.log(`   ✅ 모달에서 클릭`);

    // 3. 우측 패널 헤더 검증
    const headers = await getRightPanelHeader(editor);
    const matches = headers.some((h) =>
      cardName === "버튼" ? h.includes("버튼") && !h.includes("+") : h.includes(cardName)
    );
    result.headers = headers;
    result.matches = matches;
    console.log(`   우측 헤더: ${JSON.stringify(headers)}`);

    if (matches) {
      const filePath = join(OUT_DIR, `card-${cardName}.png`);
      await captureRightPanel(editor, filePath);
      result.status = "captured";
      result.file = `card-${cardName}.png`;
      console.log(`   ✅ 검증 통과 → 저장`);
    } else {
      result.status = "header_mismatch";
      const dbgPath = join(OUT_DIR, `card-${cardName}-DEBUG.png`);
      await captureRightPanel(editor, dbgPath);
      result.debug_file = `card-${cardName}-DEBUG.png`;
      console.log(`   ⚠️ 헤더 검증 실패 — DEBUG 저장`);
    }

    // 4. (옵션) 카드 삭제 — 누적 방지. 실패해도 무시.
    const deleted = await deleteCard(editor, cardName);
    result.deleted = deleted;

    log.attempts[cardName] = result;
  }

  writeFileSync(
    join(OUT_DIR, "step5d-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );

  const okCount = Object.values(log.attempts).filter(
    (a) => a.status === "captured"
  ).length;
  console.log(`\n🎉 완료: ${okCount}/${TARGETS.length}`);
} catch (err) {
  console.error("❌", err.message);
  log.error = err.message;
  writeFileSync(
    join(OUT_DIR, "step5d-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  process.exit(1);
} finally {
  await browser.close();
}
