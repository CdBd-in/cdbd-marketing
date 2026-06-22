// Step 5f: 모달 detection 수정 + 상품 카드 신규 발견 반영
// 4 잘못된 + 상품 = 5 카드 재캡쳐
// "기본 카드" 헤더가 보이면 모달 열렸다고 판정

import { chromium } from "playwright";
import "dotenv/config";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import {
  loginAndEnterEditor,
  enterFirstPageEditor,
} from "./lib/cdbd-auth.mjs";

const OUT_DIR = resolve(
  process.env.CAPTURE_OUTPUT_DIR || "./screenshots/step5-cards-and-management"
);
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = ["텍스트", "이미지", "버튼", "코드", "상품"];

async function openCardModal(editor) {
  await editor.locator("text=카드 추가하기").first().click({ force: true });
  await editor.waitForTimeout(2500);

  // 모달 열림 검증 — "기본 카드" 섹션 헤더가 보이는지 (모달 안에만 존재)
  const opened = await editor.evaluate(() => {
    for (const el of document.querySelectorAll("*")) {
      if ((el.innerText || "").trim() === "기본 카드") {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.y < 400) return true;
      }
    }
    return false;
  });
  return opened;
}

async function clickCardInModalByExactText(editor, cardName) {
  // exact innerText 매칭 + visible + 모달 영역 내부
  const target = await editor.evaluate((name) => {
    for (const el of document.querySelectorAll("div, button")) {
      const tx = (el.innerText || "").trim();
      if (tx === name) {
        const r = el.getBoundingClientRect();
        if (r.width > 50 && r.height > 30 && r.x > 50 && r.x < 1400) {
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
  }, cardName);
  if (!target) return false;
  await editor.mouse.click(target.x, target.y);
  return true;
}

async function getRightPanelHeader(editor) {
  return await editor.evaluate(() => {
    const vw = window.innerWidth;
    const candidates = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.x > vw * 0.62 && r.x < vw * 0.95 && r.y < 200 && r.y > 50 && r.height < 80) {
        const t = (el.innerText || "").trim();
        if (t && t.length < 25 && t.length > 0) candidates.push(t);
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

const browser = await chromium.launch({ headless: true });
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

    await editor.keyboard.press("Escape").catch(() => {});
    await editor.waitForTimeout(500);

    const modalOpen = await openCardModal(editor);
    if (!modalOpen) {
      result.status = "modal_failed";
      log.attempts[cardName] = result;
      console.log("   ❌ 모달 안 열림");
      continue;
    }
    console.log("   ✅ 모달 열림");

    const clicked = await clickCardInModalByExactText(editor, cardName);
    if (!clicked) {
      result.status = "no_exact_match";
      await editor.keyboard.press("Escape").catch(() => {});
      log.attempts[cardName] = result;
      console.log("   ❌ 모달에서 매칭 실패");
      continue;
    }
    await editor.waitForTimeout(3500);

    const headers = await getRightPanelHeader(editor);
    result.headers = headers;
    const matches = headers.some(
      (h) =>
        h === cardName ||
        h === cardName + " " ||
        (cardName === "버튼" && (h === "버튼" || h === "버튼 + 버튼") && false) || // 정확 매칭만
        h === cardName
    );
    // 정확히 cardName인 헤더가 있어야 매칭
    const exactMatch = headers.includes(cardName);
    result.exactMatch = exactMatch;
    console.log(`   우측 헤더: ${JSON.stringify(headers.slice(0, 5))}`);

    if (exactMatch) {
      const filePath = join(OUT_DIR, `card-${cardName}.png`);
      await captureRightPanel(editor, filePath);
      result.status = "captured";
      result.file = `card-${cardName}.png`;
      console.log(`   ✅ 검증 통과 → ${result.file}`);
    } else {
      result.status = "header_mismatch";
      const dbgPath = join(OUT_DIR, `card-${cardName}-DEBUG.png`);
      await captureRightPanel(editor, dbgPath);
      result.debug_file = `card-${cardName}-DEBUG.png`;
      console.log("   ⚠️ 헤더 불일치 → DEBUG");
    }

    log.attempts[cardName] = result;
  }

  writeFileSync(
    join(OUT_DIR, "step5f-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  const ok = Object.values(log.attempts).filter((a) => a.status === "captured")
    .length;
  console.log(`\n🎉 ${ok}/${TARGETS.length}`);
} catch (err) {
  console.error("❌", err.message);
  log.error = err.message;
  writeFileSync(
    join(OUT_DIR, "step5f-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  process.exit(1);
} finally {
  await browser.close();
}
