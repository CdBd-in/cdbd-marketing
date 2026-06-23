// blog-refs/all 의 모든 이미지를 24장씩 그리드 시트로
import { chromium } from 'playwright';
import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const dir = 'blog-refs/all';
const files = readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).sort();
const CHUNK = 20, COLS = 5, CELL = 384;
const browser = await chromium.launch();

for (let g = 0; g * CHUNK < files.length; g++) {
  const chunk = files.slice(g * CHUNK, g * CHUNK + CHUNK);
  const cells = chunk.map((f) => `<div class="c"><img src="${encodeURIComponent(f)}"><div class="l">${f.replace(/\..+$/, '')}</div></div>`).join('');
  const html = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#222;font-family:sans-serif}.grid{display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:6px;padding:6px}.c{background:#fff;border-radius:4px;overflow:hidden}.c img{width:${CELL}px;height:${Math.round(CELL * 0.6)}px;object-fit:contain;background:#eee;display:block}.l{color:#fff;background:#000;font-size:15px;padding:2px 5px;font-weight:bold}</style><div class="grid">${cells}</div>`;
  const htmlPath = resolve(dir, '_grid.html');
  writeFileSync(htmlPath, html);
  const page = await browser.newPage({ viewport: { width: COLS * (CELL + 8) + 16, height: 800 } });
  await page.goto('file://' + htmlPath);
  await page.waitForTimeout(1200);
  await page.locator('.grid').screenshot({ path: `blog-refs/grid${g + 1}.png` });
  await page.close();
  console.log(`grid${g + 1}: ${chunk.length}`);
}
await browser.close();
