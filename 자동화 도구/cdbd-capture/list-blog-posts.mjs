// 블로그 전체 게시물 목록 스크레이프 (무한스크롤/페이지네이션 대응)
// 사용: node list-blog-posts.mjs
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const all = new Map();

async function collect() {
  const links = await page.evaluate(() => {
    const out = [];
    for (const a of Array.from(document.querySelectorAll('a[href*="/post/"]'))) {
      const href = a.href.split('?')[0];
      const t = (a.textContent || '').trim().replace(/\s+/g, ' ');
      if (href.includes('/post/')) out.push({ href, t });
    }
    return out;
  });
  for (const l of links) {
    const prev = all.get(l.href) || '';
    if (l.t.length > prev.length) all.set(l.href, l.t);
  }
}

// 페이지네이션 순회 (Wix 블로그: ?page=N 시도 + 스크롤)
for (let p = 1; p <= 10; p++) {
  const url = p === 1 ? 'https://home.cdbd.in/blog' : `https://home.cdbd.in/blog/page/${p}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    await new Promise((res) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 600); y += 600; if (y >= document.body.scrollHeight) { clearInterval(t); res(); } }, 100); });
  });
  await page.waitForTimeout(1000);
  const before = all.size;
  await collect();
  if (all.size === before && p > 1) break; // 더 안 늘면 종료
}

await browser.close();
const arr = [...all.entries()].map(([href, t]) => ({ href, t }));
console.log(JSON.stringify(arr, null, 2));
console.error('TOTAL', arr.length);
