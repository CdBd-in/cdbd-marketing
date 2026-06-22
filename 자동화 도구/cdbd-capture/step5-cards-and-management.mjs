// Step 5: 미캡쳐 카드 15종 + 관리 기능 4종 — cropped 캡쳐
//
// 캡쳐 목록:
//   카드 (15종, 우측 settings panel 단독 crop):
//     기본 10: 메뉴, 프로필, 텍스트, 이미지, 유튜브, 버튼, 위치 안내, SNS, 구분선, 코드
//     2단  5: 텍스트+텍스트, 텍스트+버튼, 이미지+이미지, 이미지+버튼, 버튼+버튼
//   관리 기능 (4종):
//     팀 공유 / 개인화 QR / 페이지 연장하기 / 게시 후 페이지
//
// 출력: screenshots/step5-cards-and-management/
// 실행: node step5-cards-and-management.mjs

import { chromium } from "playwright";
import "dotenv/config";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import {
  loginAndEnterEditor,
  enterFirstPageEditor,
  extractUITexts,
} from "./lib/cdbd-auth.mjs";

const HEADLESS = process.env.HEADLESS !== "false";
const SLOW_MO = parseInt(process.env.SLOW_MO || "0", 10);
const OUT_DIR = resolve(
  process.env.CAPTURE_OUTPUT_DIR || "./screenshots/step5-cards-and-management"
);
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// === 카드 목록 (모달에 보이는 진짜 명칭) ===
const BASIC_CARDS = [
  "메뉴",
  "프로필",
  "텍스트",
  "이미지",
  "유튜브",
  "버튼",
  "위치 안내",
  "SNS",
  "구분선",
  "코드",
];
const TWO_COL_CARDS = [
  "텍스트 + 텍스트",
  "텍스트 + 버튼",
  "이미지 + 이미지",
  "이미지 + 버튼",
  "버튼 + 버튼",
];

// === Crop 전략 ===
// 우측 settings panel만 단독 crop. selector 우선, fallback은 viewport 기반 좌표.
async function captureRightPanel(editor, filePath) {
  // 1) selector 시도
  const panelSelectors = [
    'aside[class*="right"]',
    'aside[class*="settings"]',
    '[class*="RightPanel"]',
    '[class*="rightPanel"]',
    'div[class*="settings-panel"]',
  ];
  for (const sel of panelSelectors) {
    try {
      const loc = editor.locator(sel).first();
      if ((await loc.count()) > 0) {
        const box = await loc.boundingBox();
        if (box && box.width > 200 && box.height > 200) {
          await loc.screenshot({ path: filePath });
          return { method: "selector", selector: sel, box };
        }
      }
    } catch (e) {}
  }
  // 2) fallback: viewport 우측 1/3 영역 clip
  const vw = editor.viewportSize();
  const clip = {
    x: Math.floor(vw.width * 0.66),
    y: 80, // 상단 툴바 skip
    width: Math.floor(vw.width * 0.34),
    height: vw.height - 80,
  };
  await editor.screenshot({ path: filePath, clip, fullPage: false });
  return { method: "fallback-clip", clip };
}

// === 카드 추가 + 패널 캡쳐 ===
async function captureCardPanel(editor, cardName, safeName) {
  // 1) 카드 추가 모달 열기
  const addBtn = editor.locator("text=카드 추가하기").first();
  await addBtn.click({ force: true });
  await editor.waitForTimeout(1800);

  // 2) 모달에서 카드 클릭
  // exact 매치 우선, 부분 매치 fallback
  let clicked = false;
  try {
    const exact = editor.getByText(cardName, { exact: true }).first();
    if ((await exact.count()) > 0) {
      await exact.click({ force: true });
      clicked = true;
    }
  } catch (e) {}
  if (!clicked) {
    try {
      await editor
        .locator(`text=${cardName}`)
        .first()
        .click({ force: true, timeout: 5000 });
      clicked = true;
    } catch (e) {}
  }
  if (!clicked) {
    // 모달 닫기 시도
    await editor.keyboard.press("Escape").catch(() => {});
    return { status: "not_found_in_modal" };
  }

  // 3) 카드 추가 후 우측 패널 렌더링 대기
  await editor.waitForTimeout(2500);

  // 4) 캡쳐
  const filePath = join(OUT_DIR, `card-${safeName}.png`);
  const result = await captureRightPanel(editor, filePath);

  return { status: "captured", file: `card-${safeName}.png`, ...result };
}

// === 관리 기능 캡쳐 (best-effort) ===
async function captureManagementFunctions(page, editor, context) {
  const results = {};

  // 1. 팀 공유 / 멤버 권한 — 에디터 좌상단 로고/메뉴 또는 페이지 설정
  try {
    console.log("\n▶ 관리 1) 팀 공유 시도");
    // 가설 1: 좌상단 CdBd 로고 클릭 → 사이드바 펼침
    const logoCandidates = [
      editor.locator('a[href*="/editor"]').first(), // 로고 보통 링크
      editor.locator('img[alt*="CdBd"]').first(),
      editor.locator('[class*="logo"]').first(),
    ];
    for (const loc of logoCandidates) {
      if ((await loc.count()) > 0) {
        await loc.click({ force: true, timeout: 3000 }).catch(() => {});
        await editor.waitForTimeout(1500);
        break;
      }
    }
    // 사이드바에서 팀/공유/멤버 검색
    const shareTriggers = [
      editor.locator("text=/팀/").first(),
      editor.locator("text=/공유/").first(),
      editor.locator("text=/멤버/").first(),
      editor.locator("text=/초대/").first(),
    ];
    for (const trigger of shareTriggers) {
      if ((await trigger.count()) > 0) {
        try {
          await trigger.click({ force: true, timeout: 3000 });
          await editor.waitForTimeout(2000);
          const filePath = join(OUT_DIR, "관리-팀공유.png");
          await editor.screenshot({ path: filePath });
          results.team_share = { status: "captured", file: "관리-팀공유.png" };
          console.log("   ✅ 팀 공유");
          break;
        } catch (e) {}
      }
    }
    if (!results.team_share) {
      results.team_share = { status: "trigger_not_found" };
      console.log("   ⚠️ 팀 공유 trigger 미발견 — 수동 가이드 필요");
    }
  } catch (e) {
    results.team_share = { status: "error", error: e.message };
  }

  // 2. 개인화 QR — 대시보드 카드 QR 아이콘 또는 에디터 카드 메뉴
  try {
    console.log("\n▶ 관리 2) 개인화 QR 시도");
    // 대시보드로 돌아가서 카드의 QR 아이콘 클릭
    await page.goto("https://www.cdbd.in/editor", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const qrIcons = [
      page.locator('button[aria-label*="QR"]').first(),
      page.locator('img[alt*="QR"]').first(),
      page.locator('[class*="qr"]').first(),
    ];
    for (const loc of qrIcons) {
      if ((await loc.count()) > 0) {
        try {
          await loc.click({ force: true, timeout: 3000 });
          await page.waitForTimeout(2000);
          const filePath = join(OUT_DIR, "관리-개인화QR.png");
          await page.screenshot({ path: filePath });
          results.qr = { status: "captured", file: "관리-개인화QR.png" };
          console.log("   ✅ QR");
          break;
        } catch (e) {}
      }
    }
    if (!results.qr) {
      // SVG QR icon은 보통 클릭 가능한 영역. 대시보드 첫 카드 hover 후 QR 검색
      const firstCard = page.locator('[class*="card"]').first();
      await firstCard.hover().catch(() => {});
      await page.waitForTimeout(1500);
      const svgQr = page.locator('svg[class*="qr" i]').first();
      if ((await svgQr.count()) > 0) {
        await svgQr.click({ force: true }).catch(() => {});
        await page.waitForTimeout(2000);
        await page.screenshot({ path: join(OUT_DIR, "관리-개인화QR.png") });
        results.qr = { status: "captured-hover", file: "관리-개인화QR.png" };
      }
    }
    if (!results.qr) {
      results.qr = { status: "trigger_not_found" };
      console.log("   ⚠️ QR trigger 미발견");
    }
  } catch (e) {
    results.qr = { status: "error", error: e.message };
  }

  // 3. 페이지 연장하기 — 대시보드 카드의 연장하기 버튼 클릭 → 다이얼로그 캡쳐
  try {
    console.log("\n▶ 관리 3) 페이지 연장하기 시도");
    const extend = page.locator("text=/연장하기/").first();
    if ((await extend.count()) > 0) {
      await extend.click({ force: true, timeout: 3000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(OUT_DIR, "관리-페이지연장.png") });
      results.extend = { status: "captured", file: "관리-페이지연장.png" };
      console.log("   ✅ 연장하기");
      // 다이얼로그 닫기
      await page.keyboard.press("Escape").catch(() => {});
    } else {
      results.extend = { status: "trigger_not_found" };
      console.log("   ⚠️ 연장하기 버튼 미발견");
    }
  } catch (e) {
    results.extend = { status: "error", error: e.message };
  }

  // 4. 게시 후 페이지 — 게시하기 옵션 ▼ (실제 게시 X, 옵션 패널만)
  try {
    console.log("\n▶ 관리 4) 게시하기 옵션 패널 시도");
    // 에디터로 돌아감
    await editor.bringToFront().catch(() => {});
    const publishOpt = editor
      .locator('button:has-text("게시하기")')
      .locator("..")
      .locator("button")
      .last();
    if ((await publishOpt.count()) > 0) {
      await publishOpt.click({ force: true, timeout: 3000 });
      await editor.waitForTimeout(1800);
      await editor.screenshot({ path: join(OUT_DIR, "관리-게시옵션.png") });
      results.publish_option = {
        status: "captured",
        file: "관리-게시옵션.png",
      };
      console.log("   ✅ 게시 옵션");
    } else {
      results.publish_option = { status: "trigger_not_found" };
      console.log("   ⚠️ 게시 옵션 ▼ 미발견");
    }
  } catch (e) {
    results.publish_option = { status: "error", error: e.message };
  }

  return results;
}

// === 메인 ===
const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ko-KR",
});
const page = await context.newPage();
const log = {
  cards_basic: {},
  cards_2col: {},
  management: {},
  started_at: new Date().toISOString(),
};

try {
  console.log("▶ 1) 로그인 + 대시보드");
  await loginAndEnterEditor(page, context);

  console.log("▶ 2) 첫 페이지 에디터 진입");
  const editor = await enterFirstPageEditor(page, context);
  console.log(`   에디터 URL: ${editor.url()}`);

  // === A. 기본 카드 10종 ===
  console.log("\n▶ 3) 기본 카드 10종 캡쳐");
  for (const cardName of BASIC_CARDS) {
    const safeName = cardName.replace(/\s+/g, "_");
    console.log(`   ▶ "${cardName}"`);
    const res = await captureCardPanel(editor, cardName, safeName);
    log.cards_basic[cardName] = res;
    if (res.status === "captured") {
      console.log(`     ✅ → ${res.file} (${res.method})`);
    } else {
      console.log(`     ⚠️ ${res.status}`);
    }
  }

  // === B. 2단 카드 5종 ===
  console.log("\n▶ 4) 2단 카드 5종 캡쳐");
  for (const cardName of TWO_COL_CARDS) {
    const safeName = cardName.replace(/\s*\+\s*/g, "_plus_");
    console.log(`   ▶ "${cardName}"`);
    const res = await captureCardPanel(editor, cardName, safeName);
    log.cards_2col[cardName] = res;
    if (res.status === "captured") {
      console.log(`     ✅ → ${res.file} (${res.method})`);
    } else {
      console.log(`     ⚠️ ${res.status}`);
    }
  }

  // === C. 관리 기능 ===
  console.log("\n▶ 5) 관리 기능 4종 캡쳐");
  log.management = await captureManagementFunctions(page, editor, context);

  // === 메타데이터 저장 ===
  log.finished_at = new Date().toISOString();
  const jsonPath = join(OUT_DIR, "step5-results.json");
  writeFileSync(jsonPath, JSON.stringify(log, null, 2), "utf-8");
  console.log(`\n📝 결과 저장: ${jsonPath}`);

  // 요약
  const cardsBasicOK = Object.values(log.cards_basic).filter(
    (r) => r.status === "captured"
  ).length;
  const cards2colOK = Object.values(log.cards_2col).filter(
    (r) => r.status === "captured"
  ).length;
  const mgmtOK = Object.values(log.management).filter(
    (r) => r.status?.startsWith("captured")
  ).length;
  console.log(`\n🎉 완료!`);
  console.log(`   기본 카드: ${cardsBasicOK}/${BASIC_CARDS.length}`);
  console.log(`   2단 카드: ${cards2colOK}/${TWO_COL_CARDS.length}`);
  console.log(`   관리 기능: ${mgmtOK}/4`);
} catch (err) {
  console.error("❌ 에러:", err.message);
  console.error(err.stack);
  await page
    .screenshot({ path: join(OUT_DIR, "step5-error.png"), fullPage: true })
    .catch(() => {});
  log.error = { message: err.message, stack: err.stack };
  writeFileSync(
    join(OUT_DIR, "step5-results.json"),
    JSON.stringify(log, null, 2),
    "utf-8"
  );
  process.exit(1);
} finally {
  await browser.close();
}
