// 로컬 이미지들을 그리드 시트로 합성 (Playwright 렌더 캡처)
// 사용: node montage.mjs <out.png> <img1> <img2> ...
import { chromium } from 'playwright';
import { resolve, dirname, join } from 'path';
import { writeFileSync } from 'fs';

const out = process.argv[2];
const files = process.argv.slice(3);
const cells = files.map((f) => {
  // 시트 html과 같은 폴더 기준 상대경로 사용
  const name = f.split('/').pop();
  return `<div class="c"><img src="${encodeURIComponent(name)}"><div class="l">${name}</div></div>`;
}).join('');
const COLS = parseInt(process.env.COLS || '4', 10);
const CELL = parseInt(process.env.CELL || '320', 10);
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#222;font-family:sans-serif}
.grid{display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:8px;padding:8px}
.c{background:#fff;border-radius:6px;overflow:hidden}
.c img{width:${CELL}px;height:${Math.round(CELL*0.62)}px;object-fit:contain;background:#eee;display:block}
.l{color:#fff;background:#000;font-size:14px;padding:3px 6px}
</style><div class="grid">${cells}</div>`;

const htmlPath = join(dirname(resolve(out)), '_sheet.html');
writeFileSync(htmlPath, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: COLS * (CELL + 10) + 20, height: 800 } });
await page.goto('file://' + htmlPath);
await page.waitForTimeout(1500);
await page.locator('.grid').screenshot({ path: out });
await browser.close();
console.log('wrote', out);
