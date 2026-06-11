// Step 5i: 모달 layout 좌표 직접 클릭 (5 cols × 3 rows)
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

// 모달 layout 좌표 (viewport 1440x900)
// 5 col × 3 row 기본 카드
const COL_X = [200, 460, 720, 980, 1240]; // col centers
const ROW_Y = [287, 378, 471]; // row centers
const CARDS = {
  메뉴: [0, 0],
  프로필: [1, 0],
  텍스트: [2, 0],
  이미지: [3, 0],
  갤러리: [4, 0],
  유튜브: [0, 1],
  버튼: [1, 1],
  "Q&A": [2, 1],
  예약: [3, 1],
  상품: [4, 1],
  위치: [0, 2],
  SNS: [1, 2],
  구분선: [2, 2],
  코드: [3, 2],
};

const TARGETS = ["텍스트", "버튼"]; // 잘못된 거 + 모달에서 위치 알고 있는

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

async function getRightPanelHeader(editor) {
  return await editor.evaluate(() => {
    const vw = window.innerWidth;
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.x > vw * 0.62 && r.x < vw * 0.95 && r.y < 200 && r.y > 50 && r.height < 80) {
        const t = (el.innerText || "").trim();
        if (t && t.length < 25 && t.length > 0) out.push(t);
      }
    });
    return [...new Set(out)];
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ko-KR",
});
const page = await context.newPage();
const log = {};

try {
  await loginAndEnterEditor(page, context);
  const editor = await enterFirstPageEditor(page, context);

  for (const cardName of TARGETS) {
    console.log(`\n▶ "${cardName}"`);
    await editor.keyboard.press("Escape").catch(() => {});
    await editor.waitForTimeout(500);

    if (!(await openCardModal(editor))) {
      console.log("   ❌ 모달");
      continue;
    }
    const [col, row] = CARDS[cardName];
    const x = COL_X[col];
    const y = ROW_Y[row];
    console.log(`   클릭: (${x}, ${y})`);
    await editor.mouse.click(x, y);
    await editor.waitForTimeout(3500);

    const headers = await getRightPanelHeader(editor);
    console.log(`   헤더: ${JSON.stringify(headers.slice(0, 4))}`);
    log[cardName] = { x, y, headers };

    if (headers.includes(cardName)) {
      const filePath = join(OUT_DIR, `card-${cardName}.png`);
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
      console.log(`   ✅ ${filePath}`);
      log[cardName].status = "captured";
    } else {
      console.log("   ⚠️ mismatch");
      log[cardName].status = "mismatch";
    }
  }

  writeFileSync(
    join(OUT_DIR, "step5i-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
} catch (err) {
  console.error("❌", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
