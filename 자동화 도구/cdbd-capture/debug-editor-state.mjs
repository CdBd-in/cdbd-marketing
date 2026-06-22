// 에디터 현재 상태 점검
import { chromium } from "playwright";
import "dotenv/config";
import {
  loginAndEnterEditor,
  enterFirstPageEditor,
} from "./lib/cdbd-auth.mjs";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ko-KR",
});
const page = await context.newPage();

await loginAndEnterEditor(page, context);
const editor = await enterFirstPageEditor(page, context);

// 스크린샷
await editor.screenshot({
  path: "./screenshots/step5-cards-and-management/DEBUG-editor-state.png",
  fullPage: false,
});

// 모든 버튼 텍스트 + bounding box
const buttons = await editor.evaluate(() => {
  const out = [];
  document.querySelectorAll("button").forEach((b, i) => {
    const t = (b.innerText || "").trim().slice(0, 40);
    const r = b.getBoundingClientRect();
    if (t)
      out.push({
        i,
        text: t,
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        visible: r.width > 0 && r.height > 0,
      });
  });
  return out;
});

const addBtns = buttons.filter((b) => b.text.includes("카드 추가"));
console.log(`"카드 추가" 포함 버튼: ${addBtns.length}개`);
for (const b of addBtns) {
  console.log(
    `  [${b.i}] "${b.text}" @ (${b.x},${b.y}) ${b.w}x${b.h} visible=${b.visible}`
  );
}

console.log("\n=== 모든 버튼 텍스트 (상위 30) ===");
for (const b of buttons.slice(0, 30)) {
  console.log(`  [${b.i}] "${b.text}" @ (${b.x},${b.y})`);
}

await browser.close();
