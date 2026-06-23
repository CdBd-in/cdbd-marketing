// 블로그 게시물 본문 이미지 URL 추출 (Wix lazy-load 대응)
// 사용: node scrape-blog-images.mjs <postUrl> [minWidth=300]
// 출력: JSON 배열 [{id, url(original res), renderedW, renderedH, naturalW, naturalH, alt, y}]

import { chromium } from 'playwright';

const URL = process.argv[2];
const MIN_W = parseInt(process.argv[3] || '300', 10);
if (!URL) { console.error('need url'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);

// 천천히 풀스크롤로 lazy-load 트리거
await page.evaluate(async () => {
  await new Promise((res) => {
    let y = 0;
    const step = 400;
    const t = setInterval(() => {
      window.scrollBy(0, step);
      y += step;
      if (y >= document.body.scrollHeight) { clearInterval(t); res(); }
    }, 120);
  });
});
await page.waitForTimeout(1500);

const imgs = await page.evaluate((minW) => {
  const out = [];
  const seen = new Set();
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
    out.push({
      id,
      url: 'https://static.wixstatic.com/media/' + id,
      renderedW: rw, renderedH: rh,
      naturalW: img.naturalWidth, naturalH: img.naturalHeight,
      alt: img.alt || '',
      y: Math.round(r.top + window.scrollY),
    });
  }
  out.sort((a, b) => a.y - b.y);
  return out;
}, MIN_W);

console.log(JSON.stringify(imgs, null, 2));
await browser.close();
