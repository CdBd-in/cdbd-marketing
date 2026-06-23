// 전체 게시물 본문 이미지 스캔 + 글로벌 dedupe
// 출력: blog-refs/all-index.json  { mediaId: {posts:[idx...], url} }
//      + blog-refs/all/<idx>_<i>.<ext> (게시물별 본문 이미지, 글로벌 중복 제외)
import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';

const posts = JSON.parse(readFileSync('blog-refs/posts.json', 'utf8'));
const OUT = 'blog-refs/all';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const MIN_W = 300;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

// 1차: 모든 게시물에서 본문 이미지 mediaId 수집 (다운로드 X)
const index = {}; // mediaId -> {posts:Set, url}
const perPost = {}; // idx -> [mediaId...]
for (let idx = 0; idx < posts.length; idx++) {
  try {
    await page.goto(posts[idx].href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1800);
    await page.evaluate(async () => { await new Promise((r) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 600); y += 600; if (y >= document.body.scrollHeight) { clearInterval(t); r(); } }, 90); }); });
    await page.waitForTimeout(800);
    const imgs = await page.evaluate((minW) => {
      const out = []; const seen = new Set();
      for (const img of Array.from(document.querySelectorAll('img'))) {
        const src = img.currentSrc || img.src || '';
        const m = src.match(/static\.wixstatic\.com\/media\/([^/]+~mv2\.(?:jpg|jpeg|png|gif|webp))/i);
        if (!m) continue; const id = m[1]; if (seen.has(id)) continue;
        const r = img.getBoundingClientRect(); if (Math.round(r.width) < minW) continue; seen.add(id);
        out.push({ id, url: 'https://static.wixstatic.com/media/' + id, y: Math.round(r.top + window.scrollY) });
      }
      out.sort((a, b) => a.y - b.y); return out;
    }, MIN_W);
    perPost[idx] = imgs.map((i) => i.id);
    for (const im of imgs) {
      if (!index[im.id]) index[im.id] = { posts: [], url: im.url };
      index[im.id].posts.push(idx);
    }
    console.error(`#${idx}: ${imgs.length}`);
  } catch (e) { console.error(`#${idx} ERR ${e.message}`); }
}
await browser.close();

writeFileSync('blog-refs/all-index.json', JSON.stringify({ index, perPost }, null, 2));
const ids = Object.keys(index);
const shared = ids.filter((id) => index[id].posts.length >= 4); // 4개+ 게시물 공유 = 커버/추천카드
console.error(`TOTAL unique=${ids.length}, shared(>=4 posts)=${shared.length}`);
console.log(JSON.stringify({ uniqueCount: ids.length, sharedCount: shared.length }));
