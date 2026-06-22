// Step 5b: step5 실패분 재시도 + 관리 기능 selector 탐색
//
// 1. card-텍스트 재시도 (modal close + 길게 대기)
// 2. 위치 안내 재시도 (이름 변형)
// 3. 관리 기능 — 에디터/대시보드의 모든 button/link 덤프 → selector 찾기

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

async function captureRightPanel(editor, filePath) {
  const panelSelectors = [
    'aside[class*="right"]',
    'aside[class*="settings"]',
    'div[class*="settings-panel"]',
  ];
  for (const sel of panelSelectors) {
    try {
      const loc = editor.locator(sel).first();
      if ((await loc.count()) > 0) {
        const box = await loc.boundingBox();
        if (box && box.width > 200 && box.height > 200) {
          await loc.screenshot({ path: filePath });
          return { method: "selector", selector: sel };
        }
      }
    } catch (e) {}
  }
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
  return { method: "fallback-clip" };
}

async function addCardWithRetry(editor, cardName, safeName) {
  // 카드 추가 모달 열기
  await editor.locator("text=카드 추가하기").first().click({ force: true });
  await editor.waitForTimeout(2000);

  // 모달 안에서 카드 찾기 — dialog scope
  const dialog = editor.locator('[role="dialog"]').first();
  const candidates = [
    () => dialog.getByText(cardName, { exact: true }).first(),
    () => dialog.getByText(cardName, { exact: false }).first(),
    () => editor.getByRole("button", { name: cardName }).first(),
    () => editor.locator(`text="${cardName}"`).first(),
  ];

  let clicked = false;
  for (const getLoc of candidates) {
    try {
      const loc = getLoc();
      if ((await loc.count()) > 0) {
        await loc.click({ force: true, timeout: 4000 });
        clicked = true;
        break;
      }
    } catch (e) {}
  }

  if (!clicked) {
    await editor.keyboard.press("Escape").catch(() => {});
    return { status: "not_found", cardName };
  }

  // 추가 후 대기 + 모달 강제 close
  await editor.waitForTimeout(3000);
  await editor.keyboard.press("Escape").catch(() => {});
  await editor.waitForTimeout(800);

  // 캡쳐
  const filePath = join(OUT_DIR, `card-${safeName}.png`);
  const result = await captureRightPanel(editor, filePath);
  return { status: "captured", file: `card-${safeName}.png`, ...result };
}

const browser = await chromium.launch({ headless: HEADLESS });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ko-KR",
});
const page = await context.newPage();
const log = { retries: {}, exploration: {} };

try {
  console.log("▶ 로그인 + 에디터 진입");
  await loginAndEnterEditor(page, context);
  const editor = await enterFirstPageEditor(page, context);
  console.log(`   에디터: ${editor.url()}`);

  // === 1. 텍스트 재시도 ===
  console.log("\n▶ 1) card-텍스트 재시도");
  log.retries.텍스트 = await addCardWithRetry(editor, "텍스트", "텍스트");
  console.log(`   ${JSON.stringify(log.retries.텍스트)}`);

  // === 2. 위치 안내 재시도 (이름 변형) ===
  console.log("\n▶ 2) 위치 안내 재시도 (이름 변형 4종)");
  const locNames = ["위치 안내", "위치", "지도", "위치안내"];
  for (const name of locNames) {
    const safe = name.replace(/\s+/g, "_");
    const res = await addCardWithRetry(editor, name, `위치_${safe}`);
    log.retries[`위치_${safe}`] = res;
    if (res.status === "captured") {
      console.log(`   ✅ "${name}" → ${res.file}`);
      break;
    } else {
      console.log(`   ⚠️ "${name}" 미발견`);
    }
  }

  // === 3. 관리 기능 — 페이지/대시보드 모든 인터랙티브 요소 덤프 ===
  console.log("\n▶ 3) 관리 기능 탐색");

  // 3a. 에디터 모든 button/link 텍스트 + aria-label 덤프
  const editorElements = await editor.evaluate(() => {
    const result = [];
    document
      .querySelectorAll("button, a, [role='button'], [aria-label]")
      .forEach((el) => {
        const text = (el.innerText || "").trim().slice(0, 60);
        const aria = el.getAttribute("aria-label") || "";
        const title = el.getAttribute("title") || "";
        const tag = el.tagName.toLowerCase();
        if (text || aria || title) {
          result.push({ tag, text, aria, title });
        }
      });
    return result;
  });
  log.exploration.editor_elements = editorElements;
  console.log(`   에디터: ${editorElements.length}개 요소 덤프`);

  // 3b. 대시보드로 이동 후 모든 인터랙티브 요소
  await page.goto("https://www.cdbd.in/editor", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const dashboardElements = await page.evaluate(() => {
    const result = [];
    document
      .querySelectorAll("button, a, [role='button'], [aria-label]")
      .forEach((el) => {
        const text = (el.innerText || "").trim().slice(0, 60);
        const aria = el.getAttribute("aria-label") || "";
        const title = el.getAttribute("title") || "";
        if (text || aria || title) {
          result.push({
            tag: el.tagName.toLowerCase(),
            text,
            aria,
            title,
          });
        }
      });
    return result;
  });
  log.exploration.dashboard_elements = dashboardElements;
  console.log(`   대시보드: ${dashboardElements.length}개 요소 덤프`);

  // 3c. 첫 페이지 카드 hover 후 추가 요소 노출
  const firstCard = page.locator('[class*="card"]').first();
  if ((await firstCard.count()) > 0) {
    await firstCard.hover().catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUT_DIR, "explore-dashboard-card-hover.png"),
    });
    const hoverElements = await page.evaluate(() => {
      const result = [];
      document
        .querySelectorAll("button, a, [role='button']")
        .forEach((el) => {
          const text = (el.innerText || "").trim().slice(0, 60);
          if (text) result.push(text);
        });
      return [...new Set(result)];
    });
    log.exploration.dashboard_card_hover = hoverElements;
    console.log(`   카드 hover: ${hoverElements.length}개`);
  }

  // 3d. 관리 키워드 검색 (텍스트/aria/title에서)
  const allElements = [...editorElements, ...dashboardElements];
  const keywords = [
    "팀",
    "공유",
    "멤버",
    "초대",
    "권한",
    "QR",
    "연장",
    "게시",
    "AI",
    "디자인",
    "테마",
    "색상",
    "서체",
    "언어",
    "미리보기",
  ];
  const found = {};
  for (const kw of keywords) {
    const matches = allElements.filter(
      (e) =>
        e.text?.includes(kw) || e.aria?.includes(kw) || e.title?.includes(kw)
    );
    if (matches.length > 0) found[kw] = matches;
  }
  log.exploration.keyword_matches = found;
  console.log(`\n   📋 키워드 매칭:`);
  for (const [kw, matches] of Object.entries(found)) {
    console.log(`     "${kw}" → ${matches.length}개`);
    for (const m of matches.slice(0, 3)) {
      console.log(
        `       - <${m.tag}> text="${m.text}" aria="${m.aria}" title="${m.title}"`
      );
    }
  }

  writeFileSync(
    join(OUT_DIR, "step5b-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  console.log(`\n📝 저장: ${join(OUT_DIR, "step5b-results.json")}`);
  console.log("\n🎉 step5b 완료");
} catch (err) {
  console.error("❌:", err.message);
  log.error = { message: err.message, stack: err.stack };
  writeFileSync(
    join(OUT_DIR, "step5b-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  process.exit(1);
} finally {
  await browser.close();
}
