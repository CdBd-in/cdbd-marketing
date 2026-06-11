// Step 5c: 잘못 캡쳐된 4종 (텍스트·이미지·버튼·코드) 검증 기반 재캡쳐
//
// 문제: step5/5b에서 text 매칭이 모달 외 요소를 클릭 → 패널이 다른 카드의 것
// 해결: 모달 내부만 strictly scope + 클릭 후 우측 패널 헤더 텍스트 검증

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

async function addCardVerified(editor, cardName) {
  // 0) 깨끗한 상태 — 떠 있는 모달 닫기
  await editor.keyboard.press("Escape").catch(() => {});
  await editor.waitForTimeout(500);

  // 1) 모달 열기 — role 기반 selector (text= 는 누적된 카드 label과 충돌)
  const addBtnCandidates = [
    () => editor.getByRole("button", { name: "카드 추가하기" }).first(),
    () => editor.locator('button:has-text("카드 추가하기")').first(),
  ];

  let modalOpened = false;
  for (const getBtn of addBtnCandidates) {
    try {
      const btn = getBtn();
      await btn.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await btn.click({ force: true, timeout: 5000 });
      await editor.waitForTimeout(2000);
      const dlgCount = await editor.locator('[role="dialog"]').count();
      if (dlgCount > 0) {
        modalOpened = true;
        break;
      }
    } catch (e) {}
  }

  if (!modalOpened) {
    return { status: "modal_not_opened" };
  }

  const dialog = editor.locator('[role="dialog"]').first();

  // 2) 모달 내부에서만 정확히 매칭 — getByRole 우선
  // 카드는 보통 button 또는 클릭 가능한 div. role=button + exact name.
  let clicked = false;
  const inDialog = dialog;
  const candidates = [
    () => inDialog.getByRole("button", { name: cardName, exact: true }).first(),
    () => inDialog.getByText(cardName, { exact: true }).first(),
    () =>
      inDialog.locator(`button:has-text("${cardName}")`).first(),
  ];

  for (const getLoc of candidates) {
    try {
      const loc = getLoc();
      if ((await loc.count()) > 0) {
        // 모달 안에 있는지 검증 — bounding box가 모달 내부
        const box = await loc.boundingBox();
        const dialogBox = await dialog.boundingBox();
        if (
          box &&
          dialogBox &&
          box.x >= dialogBox.x &&
          box.y >= dialogBox.y &&
          box.x + box.width <= dialogBox.x + dialogBox.width
        ) {
          await loc.click({ force: true, timeout: 5000 });
          clicked = true;
          break;
        }
      }
    } catch (e) {}
  }

  if (!clicked) {
    await editor.keyboard.press("Escape").catch(() => {});
    return { status: "no_dialog_match" };
  }

  // 3) 모달 close 대기
  await editor.waitForTimeout(3000);

  // 4) 우측 패널 헤더 검증 — 우측 1/3 영역에서 카드 이름 확인
  const vw = editor.viewportSize();
  const headerText = await editor.evaluate(
    ({ vwWidth }) => {
      // 우측 영역에서 텍스트 추출
      const elems = document.elementsFromPoint(vwWidth * 0.83, 100);
      const texts = elems
        .map((e) => e.innerText?.trim() || "")
        .filter((t) => t && t.length < 20);
      return texts;
    },
    { vwWidth: vw.width }
  );

  // 5) 좀 더 정확한 panel 헤더 확인 — h1/h2/h3 in right area
  const panelHeader = await editor.evaluate(
    ({ vwWidth }) => {
      const headers = [];
      document.querySelectorAll("h1, h2, h3, [class*='title'], [class*='header']").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.x > vwWidth * 0.6 && rect.y < 200) {
          const t = el.innerText?.trim();
          if (t && t.length < 30) headers.push(t);
        }
      });
      return headers;
    },
    { vwWidth: vw.width }
  );

  return {
    status: clicked ? "clicked" : "failed",
    rightAreaTexts: headerText.slice(0, 5),
    panelHeaders: panelHeader,
    expectedName: cardName,
    headerMatches: panelHeader.some((h) => h.includes(cardName)),
  };
}

async function captureRightPanelByCardName(editor, cardName, safeName) {
  // 우측 panel 전체 screenshot. Fallback: viewport right area
  const vw = editor.viewportSize();
  const filePath = join(OUT_DIR, `card-${safeName}.png`);
  await editor.screenshot({
    path: filePath,
    clip: {
      x: Math.floor(vw.width * 0.66),
      y: 80,
      width: Math.floor(vw.width * 0.34),
      height: vw.height - 80,
    },
  });
  return filePath;
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
    console.log(`\n▶ "${cardName}" 검증 캡쳐`);
    const result = await addCardVerified(editor, cardName);
    log.attempts[cardName] = result;
    console.log(`   상태: ${result.status}`);
    console.log(`   우측 헤더들: ${JSON.stringify(result.panelHeaders)}`);

    if (result.status === "clicked") {
      if (result.headerMatches) {
        const file = await captureRightPanelByCardName(editor, cardName, cardName);
        log.attempts[cardName].file = file;
        console.log(`   ✅ 헤더 검증 통과 → 저장`);
      } else {
        console.log(`   ⚠️ 헤더 불일치 — "${cardName}" 미발견. 저장 안 함.`);
        // 디버그용 임시 캡쳐
        const dbgFile = await captureRightPanelByCardName(editor, cardName, `${cardName}-DEBUG`);
        log.attempts[cardName].debug_file = dbgFile;
      }
    }
  }

  writeFileSync(
    join(OUT_DIR, "step5c-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  console.log("\n📝 저장: step5c-results.json");
} catch (err) {
  console.error("❌", err.message);
  log.error = err.message;
  writeFileSync(
    join(OUT_DIR, "step5c-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  process.exit(1);
} finally {
  await browser.close();
}
