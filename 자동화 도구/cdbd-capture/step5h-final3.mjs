// Step 5h: cursor-pointer wrapper 기반 카드 매칭
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

const TARGETS = ["텍스트"];

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

async function clickCardByWrapper(editor, cardName) {
  // 카드 wrapper: <div class="...cursor-pointer..."> 안에 카드 이름 텍스트 + 아이콘
  // 모달 안의 wrapper만 — viewport visible + 모달 좌표
  const target = await editor.evaluate((name) => {
    const wrappers = document.querySelectorAll('[class*="cursor-pointer"]');
    for (const w of wrappers) {
      const tx = (w.innerText || "").trim();
      if (tx === name) {
        const r = w.getBoundingClientRect();
        if (
          r.y > 100 &&
          r.y < 800 &&
          r.x > 50 &&
          r.x < 1400 &&
          r.width > 0 &&
          r.height > 0
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
      console.log("   ❌ 모달");
      continue;
    }

    const target = await clickCardByWrapper(editor, cardName);
    if (!target) {
      result.status = "no_wrapper_match";
      log.attempts[cardName] = result;
      console.log("   ❌ wrapper 매칭");
      continue;
    }
    result.clicked_at = target;
    console.log(`   ✅ 클릭: (${target.x}, ${target.y}) size ${target.w}x${target.h}`);
    await editor.waitForTimeout(3500);

    const headers = await getRightPanelHeader(editor);
    result.headers = headers;
    console.log(`   헤더: ${JSON.stringify(headers.slice(0, 4))}`);

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
      result.status = "captured";
      result.file = `card-${cardName}.png`;
      console.log(`   ✅ ${result.file}`);
    } else {
      result.status = "header_mismatch";
      console.log("   ⚠️");
    }
    log.attempts[cardName] = result;
  }

  writeFileSync(
    join(OUT_DIR, "step5h-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  console.log("\n🎉 done");
} catch (err) {
  console.error("❌", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
