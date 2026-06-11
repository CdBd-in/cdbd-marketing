// 모달 안 카드 요소 DOM 구조 검사
import { chromium } from "playwright";
import "dotenv/config";
import { writeFileSync } from "fs";
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

await editor.locator("text=카드 추가하기").first().click({ force: true });
await editor.waitForTimeout(2500);

// 모든 "텍스트" exact 매칭 요소 + bounds + parent
const matches = await editor.evaluate(() => {
  const out = [];
  document.querySelectorAll("*").forEach((el, i) => {
    const tx = (el.innerText || "").trim();
    if (tx === "텍스트") {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      out.push({
        i,
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 60),
        role: el.getAttribute("role"),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        parentTag: el.parentElement?.tagName,
        parentRole: el.parentElement?.getAttribute("role"),
        parentCls: (el.parentElement?.className || "").toString().slice(0, 60),
      });
    }
  });
  return out;
});
console.log("=== exact '텍스트' matches ===");
console.log(JSON.stringify(matches, null, 2));

await browser.close();
