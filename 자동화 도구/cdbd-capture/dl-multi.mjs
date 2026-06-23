// 여러 게시물 본문 이미지를 한 브라우저로 스크레이프+다운로드
// 사용: node dl-multi.mjs <idx:prefix> <idx:prefix> ...
//   idx = blog-refs/posts.json 인덱스
import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';

const posts = JSON.parse(readFileSync('blog-refs/posts.json', 'utf8'));
const jobs = process.argv.slice(2).map((a) => { const [i, p] = a.split(':'); return { url: posts[+i].href, prefix: p }; });
const OUT = 'blog-refs';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const MIN_W = 280;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const summary = [];
for (const job of jobs) {
  try {
    await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2200);
    await page.evaluate(async () => { await new Promise((res) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 500); y += 500; if (y >= document.body.scrollHeight) { clearInterval(t); res(); } }, 110); }); });
    await page.waitForTimeout(1200);
    const imgs = await page.evaluate((minW) => {
      const out = []; const seen = new Set();
      for (const img of Array.from(document.querySelectorAll('img'))) {
        const src = img.currentSrc || img.src || '';
        const m = src.match(/static\.wixstatic\.com\/media\/([^/]+~mv2\.(?:jpg|jpeg|png|gif|webp))/i);
        if (!m) continue; const id = m[1]; if (seen.has(id)) continue;
        const r = img.getBoundingClientRect(); const rw = Math.round(r.width);
        if (rw < minW) continue; seen.add(id);
        out.push({ id, url: 'https://static.wixstatic.com/media/' + id, y: Math.round(r.top + window.scrollY) });
      }
      out.sort((a, b) => a.y - b.y); return out;
    }, MIN_W);
    let i = 0;
    for (const im of imgs) {
      i++;
      const ext = (im.id.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg').toLowerCase();
      const file = `${OUT}/${job.prefix}_${i}.${ext}`;
      const resp = await fetch(im.url);
      writeFileSync(file, Buffer.from(await resp.arrayBuffer()));
      summary.push(file);
    }
    console.error(`${job.prefix}: ${i} imgs`);
  } catch (e) { console.error(`${job.prefix}: ERROR ${e.message}`); }
}
await browser.close();
console.log(summary.join('\n'));
