// 블로그 게시물 본문 이미지 스크레이프 + 다운로드
// 사용: node dl-blog-refs.mjs <prefix> <postUrl> [minWidth=300]
// 출력: blog-refs/<prefix>_<i>.jpg  + 콘솔에 manifest

import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

const PREFIX = process.argv[2];
const URL = process.argv[3];
const MIN_W = parseInt(process.argv[4] || '300', 10);
if (!PREFIX || !URL) { console.error('need prefix + url'); process.exit(1); }

const OUT = 'blog-refs';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);
await page.evaluate(async () => {
  await new Promise((res) => {
    let y = 0; const step = 400;
    const t = setInterval(() => {
      window.scrollBy(0, step); y += step;
      if (y >= document.body.scrollHeight) { clearInterval(t); res(); }
    }, 120);
  });
});
await page.waitForTimeout(1500);

const imgs = await page.evaluate((minW) => {
  const out = []; const seen = new Set();
  for (const img of Array.from(document.querySelectorAll('img'))) {
    const src = img.currentSrc || img.src || '';
    const m = src.match(/static\.wixstatic\.com\/media\/([^/]+~mv2\.(?:jpg|jpeg|png|gif|webp))/i);
    if (!m) continue;
    const id = m[1];
    if (seen.has(id)) continue;
    const r = img.getBoundingClientRect();
    const rw = Math.round(r.width), rh = Math.round(r.height);
    if (rw < minW) continue;
    seen.add(id);
    out.push({ id, url: 'https://static.wixstatic.com/media/' + id, renderedW: rw, renderedH: rh, naturalW: img.naturalWidth, naturalH: img.naturalHeight, y: Math.round(r.top + window.scrollY) });
  }
  out.sort((a, b) => a.y - b.y);
  return out;
}, MIN_W);
await browser.close();

const manifest = [];
let i = 0;
for (const im of imgs) {
  i++;
  const ext = (im.id.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg').toLowerCase();
  const file = `${OUT}/${PREFIX}_${i}.${ext}`;
  const resp = await fetch(im.url);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(file, buf);
  manifest.push({ file, url: im.url, natW: im.naturalW, natH: im.naturalH });
}
console.log(JSON.stringify({ prefix: PREFIX, count: manifest.length, manifest }, null, 2));
