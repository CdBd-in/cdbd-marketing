// 카탈로그 viewer 페이지별 캡처 (C 멀티목업용)
// ─────────────────────────────────────────────────────────────
// 카탈로그 viewer는 화살표 없는 "가로 스와이프 캐러셀"("1/4") 구조.
// Microlink로는 1페이지만 캡처됨 → Playwright 마우스 드래그로 페이지를 넘겨가며
// 각 페이지의 "채도 있는 콘텐츠 영역"만 클립 (회색 여백·페이저 바 제거).
//
// viewer는 공개 페이지 → 로그인 불필요.
//
// 실행: node capture-catalog-pages.mjs <viewer-url> <outPrefix> [pageCount]
// 예:   node capture-catalog-pages.mjs https://www.cdbd.in/templates/catalog/newarrival/viewer nvc 4
// 결과: screenshots/catalog-pages/{prefix}-page{N}.png
// ─────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const URL = process.argv[2] || 'https://www.cdbd.in/templates/catalog/newarrival/viewer';
const PREFIX = process.argv[3] || 'catalog';
const MAX_PAGES = parseInt(process.argv[4] || '0', 10); // 0 = 페이저에서 자동 감지

const OUT = resolve('./screenshots/catalog-pages');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'ko-KR',
  deviceScaleFactor: 2,
  hasTouch: true,
});
const page = await ctx.newPage();

// "1/4" 페이저 텍스트 읽기 (페이지 전환 확인용)
const readPager = async () => page.evaluate(() => {
  for (const el of document.querySelectorAll('*')) {
    const t = (el.textContent || '').trim();
    if (/^\d+\/\d+$/.test(t)) return t;
  }
  return null;
});

// 채도 있는 색(회색·흰색·검정 제외) 요소들의 union bounding box
// → 카탈로그 콘텐츠 카드 영역만 추출 (회색 여백 제외)
const contentBounds = async () => page.evaluate(() => {
  const sat = (c) => {
    const m = c.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return false;
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return (mx - mn) > 25 && mx > 40; // 채도 있음 + 너무 어둡지 않음
  };
  let top = 99999, bot = 0, found = false;
  for (const el of document.querySelectorAll('div,section,header,main')) {
    const r = el.getBoundingClientRect();
    if (r.width < 300 || r.height < 20 || r.height > 844) continue;
    if (sat(getComputedStyle(el).backgroundColor)) {
      found = true; top = Math.min(top, r.top); bot = Math.max(bot, r.bottom);
    }
  }
  if (!found) return null;
  top = Math.max(0, Math.floor(top)); bot = Math.min(844, Math.ceil(bot));
  return { x: 0, y: top, width: 390, height: bot - top };
});

// 다음 페이지로 스와이프 (오른쪽→왼쪽 마우스 드래그)
const swipeNext = async () => {
  await page.mouse.move(312, 422);
  await page.mouse.down();
  await page.mouse.move(78, 422, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(1300);
};

try {
  console.log('▶', URL);
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(5000);

  // 하단 페이저 바(bg-black "N/M") 숨기기 — 캡처에 안 들어가도록
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('div')) {
      const t = (el.textContent || '').trim();
      if (/^\d+\/\d+$/.test(t)) {
        let p = el;
        for (let i = 0; i < 4 && p; i++) {
          if (p.className && /bg-black/.test(p.className.toString())) { p.style.display = 'none'; break; }
          p = p.parentElement;
        }
      }
    }
  });

  const pager0 = await readPager();
  const total = MAX_PAGES || (pager0 ? parseInt(pager0.split('/')[1]) : 4);
  console.log(`총 페이지: ${total} (페이저 ${pager0})`);

  for (let i = 1; i <= total; i++) {
    await page.waitForTimeout(700);
    const b = await contentBounds();
    const path = join(OUT, `${PREFIX}-page${i}.png`);
    if (b && b.height > 200) {
      await page.screenshot({ path, clip: b });
      console.log(`  ✅ p${i} (${await readPager()}) clip y=${b.y} h=${b.height}`);
    } else {
      await page.screenshot({ path });
      console.log(`  ⚠️ p${i} 콘텐츠 영역 감지 실패 → 풀 뷰포트 캡처`);
    }
    if (i < total) {
      const before = await readPager();
      await swipeNext();
      if (await readPager() === before) {
        // 스와이프 실패 시 키보드 fallback
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);
      }
    }
  }
  console.log('완료');
} catch (e) {
  console.error('❌', e.message);
  process.exit(1);
} finally {
  await browser.close();
}
