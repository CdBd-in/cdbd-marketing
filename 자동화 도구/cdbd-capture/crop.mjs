// 이미지 영역 크롭 (Playwright clip) — file:// html goto 방식
// 사용: node crop.mjs <in.png> <out.png> <x> <y> <w> <h>
import { chromium } from 'playwright';
import { resolve, dirname, join, basename } from 'path';
import { writeFileSync } from 'fs';
const [,, IN, OUT, X, Y, W, H] = process.argv;
const abs = resolve(IN);
const dir = dirname(abs);
const html = `<!doctype html><meta charset=utf-8><style>*{margin:0;padding:0}img{display:block}</style><img src="${encodeURIComponent(basename(abs))}">`;
const htmlPath = join(dir, '_crop.html');
writeFileSync(htmlPath, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1248, height: 719 } });
await page.goto('file://' + htmlPath);
await page.waitForTimeout(700);
await page.screenshot({ path: resolve(OUT), clip: { x: +X, y: +Y, width: +W, height: +H } });
await browser.close();
console.log('cropped', OUT);
