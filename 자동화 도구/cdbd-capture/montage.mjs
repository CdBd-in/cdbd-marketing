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
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#222;font-family:sans-serif}
.grid{display:grid;grid-template-columns:repeat(4,320px);gap:8px;padding:8px}
.c{background:#fff;border-radius:6px;overflow:hidden}
.c img{width:320px;height:200px;object-fit:contain;background:#eee;display:block}
.l{color:#fff;background:#000;font-size:13px;padding:3px 6px}
</style><div class="grid">${cells}</div>`;

const htmlPath = join(dirname(resolve(out)), '_sheet.html');
writeFileSync(htmlPath, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 800 } });
await page.goto('file://' + htmlPath);
await page.waitForTimeout(1500);
await page.locator('.grid').screenshot({ path: out });
await browser.close();
console.log('wrote', out);
