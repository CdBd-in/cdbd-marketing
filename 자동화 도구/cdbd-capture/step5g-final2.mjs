// Step 5g: viewport 안의 element만 매칭 (스크롤 off된 기존 카드 제외)
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

const TARGETS = ["텍스트", "버튼"]; // 이미지·코드·상품은 이미 step5f에서 성공

async function openCardModal(editor) {
  await editor.locator("text=카드 추가하기").first().click({ force: true });
  await editor.waitForTimeout(2500);
  return await editor.evaluate(() => {
    for (const el of document.querySelectorAll("*")) {
      if ((el.innerText || "").trim() === "기본 카드") {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.y > 0 && r.y < 400) return true;
      }
    }
    return false;
  });
}

async function clickCardInModalVisible(editor, cardName) {
  const target = await editor.evaluate((name) => {
    // visible viewport 안에 + 모달 영역 (x: 50-1400, y: 100-800)
    for (const el of document.querySelectorAll("div, button")) {
      const tx = (el.innerText || "").trim();
      if (tx === name) {
        const r = el.getBoundingClientRect();
        // viewport 안 + 모달 영역 + 카드 크기 (50-300 정도)
        if (
          r.y > 100 &&
          r.y < 800 &&
          r.x > 50 &&
          r.x < 1400 &&
          r.width >= 100 &&
          r.width <= 350 &&
          r.height >= 40 &&
          r.height <= 200
        ) {
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
  if (!target) return null;
  await editor.mouse.click(target.x, target.y);
  return target;
}

async function getRightPanelHeader(editor) {
  return await editor.evaluate(() => {
    const vw = window.innerWidth;
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (
        r.x > vw * 0.62 &&
        r.x < vw * 0.95 &&
        r.y < 200 &&
        r.y > 50 &&
        r.height < 80
      ) {
        const t = (el.innerText || "").trim();
        if (t && t.length < 25 && t.length > 0) out.push(t);
      }
    });
    return [...new Set(out)];
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
  await loginAndEnterEditor(page, context);
  const editor = await enterFirstPageEditor(page, context);

  for (const cardName of TARGETS) {
    console.log(`\n▶ "${cardName}"`);
    const result = { name: cardName };
    await editor.keyboard.press("Escape").catch(() => {});
    await editor.waitForTimeout(500);

    if (!(await openCardModal(editor))) {
      result.status = "modal_failed";
      log.attempts[cardName] = result;
      console.log("   ❌ 모달 안 열림");
      continue;
    }

    const target = await clickCardInModalVisible(editor, cardName);
    if (!target) {
      result.status = "no_visible_match";
      await editor.keyboard.press("Escape").catch(() => {});
      log.attempts[cardName] = result;
      console.log("   ❌ visible 매칭 실패");
      continue;
    }
    result.clicked_at = target;
    console.log(`   ✅ 클릭: (${target.x}, ${target.y})`);
    await editor.waitForTimeout(3500);

    const headers = await getRightPanelHeader(editor);
    result.headers = headers;
    const exactMatch = headers.includes(cardName);
    console.log(`   헤더: ${JSON.stringify(headers.slice(0, 4))}`);

    if (exactMatch) {
      const filePath = join(OUT_DIR, `card-${cardName}.png`);
      await captureRightPanel(editor, filePath);
      result.status = "captured";
      result.file = `card-${cardName}.png`;
      console.log(`   ✅ ${result.file}`);
    } else {
      result.status = "header_mismatch";
      const dbgPath = join(OUT_DIR, `card-${cardName}-DEBUG.png`);
      await captureRightPanel(editor, dbgPath);
      console.log("   ⚠️ DEBUG");
    }
    log.attempts[cardName] = result;
  }

  writeFileSync(
    join(OUT_DIR, "step5g-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  const ok = Object.values(log.attempts).filter((a) => a.status === "captured").length;
  console.log(`\n🎉 ${ok}/${TARGETS.length}`);
} catch (err) {
  console.error("❌", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
