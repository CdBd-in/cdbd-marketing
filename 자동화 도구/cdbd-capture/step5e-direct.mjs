// Step 5e: step5와 같은 selector로 다시 모달 열기 테스트
import { chromium } from "playwright";
import "dotenv/config";
import {
  loginAndEnterEditor,
  enterFirstPageEditor,
} from "./lib/cdbd-auth.mjs";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { resolve, join } from "path";

const OUT_DIR = resolve(
  process.env.CAPTURE_OUTPUT_DIR || "./screenshots/step5-cards-and-management"
);
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ko-KR",
});
const page = await context.newPage();
await loginAndEnterEditor(page, context);
const editor = await enterFirstPageEditor(page, context);

// step5 selector 그대로
console.log("[1] text= selector");
await editor.locator("text=카드 추가하기").first().click({ force: true });
await editor.waitForTimeout(2500);

// 모든 dialog/popup 후보 확인
const dialogs = await editor.evaluate(() => {
  const out = [];
  // role=dialog
  document.querySelectorAll('[role="dialog"]').forEach((d, i) => {
    const r = d.getBoundingClientRect();
    out.push({
      type: "role-dialog",
      i,
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
      visible: r.width > 0 && r.height > 0,
    });
  });
  // class contains modal/dialog/popup
  document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="popup"]').forEach((d, i) => {
    const r = d.getBoundingClientRect();
    if (r.width > 100 && r.height > 100)
      out.push({
        type: "class-modal",
        i,
        cls: d.className.slice(0, 60),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
  });
  // 큰 fixed/absolute 패널
  document.querySelectorAll("*").forEach((el) => {
    const s = window.getComputedStyle(el);
    if (s.position === "fixed" || s.position === "absolute") {
      const r = el.getBoundingClientRect();
      if (r.width > 600 && r.height > 400 && r.x > 100) {
        out.push({
          type: "fixed-panel",
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 60),
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
  });
  return out;
});

console.log(JSON.stringify(dialogs, null, 2));

// 클릭 후 스크린샷
await editor.screenshot({
  path: join(OUT_DIR, "DEBUG-after-add-click.png"),
  fullPage: false,
});

writeFileSync(
  join(OUT_DIR, "step5e-dialogs.json"),
  JSON.stringify(dialogs, null, 2),
  "utf-8"
);

await browser.close();
