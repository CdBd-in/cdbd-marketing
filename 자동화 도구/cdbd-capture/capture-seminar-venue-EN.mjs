// 국문 폰 목업(Figma 1380:5433)의 영문 버전 — 일시/장소 밴드 캡처
// 국문 원본과 동일 프레이밍: viewport 378 wide, clip 378x888, 일시 카드 상단 앵커 72.4px
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const URL = 'https://www.cdbd.in/templates/invitation/seminar/viewer';
const W = 378, CLIP_H = 888, ANCHOR = 72.4;   // 422/378 = 1.1164 배율 기준
const OUT = resolve('./screenshots/usecase06/en');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

// KO -> EN (기존 seminar-cover-EN 톤 유지: British 철자, VVIP 의전 어조)
const MAP = new Map([
  ['일시', 'Date & Time'],
  ['2026년 6월 24일 화요일', 'Tuesday, 24 June 2026'],
  ['18:00 ~ 20:30', '18:00 – 20:30'],
  ['장소', 'Venue'],
  ['더 시그니처 호텔 서울,', 'The Signature Hotel Seoul,'],
  ['그랜드 볼룸', 'Grand Ballroom'],
  ['*호텔 로비 도착 시 비상등을 켜주시면,', '*On arrival at the hotel lobby, please turn on'],
  ['사전 등록된 정보를 바탕으로', 'your hazard lights. A dedicated VIP valet service'],
  ['VIP 전담 발렛 서비스가 제공됩니다', 'will attend you using your pre-registered details'],
  ['.', '.'],
  ['강남구 테헤란로5길 7 KG Tower', '7 Teheran-ro 5-gil, Gangnam-gu, Seoul'],
  ['행사 장소 확인하기', 'View Event Location'],
]);

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: W, height: CLIP_H }, locale: 'ko-KR', deviceScaleFactor: 3 });
const p = await c.newPage();
await p.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(4000);
// lazy-load + 지도 타일 전부 트리거
await p.evaluate(async () => {
  let last = 0, stable = 0;
  while (stable < 3) {
    const h = document.body.scrollHeight;
    if (h === last) stable++; else { stable = 0; last = h; }
    for (let y = 0; y <= h; y += 350) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 130)); }
    await new Promise(r => setTimeout(r, 600));
  }
});
await p.waitForTimeout(1500);

// EN 주입
const rep = await p.evaluate((pairs) => {
  const map = new Map(pairs);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const hits = []; const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const t = n.textContent.trim();
    if (map.has(t)) { n.textContent = n.textContent.replace(t, map.get(t)); hits.push(t); }
  }
  return hits;
}, [...MAP.entries()]);
await p.waitForTimeout(900);

// 주입 후 실제 레이아웃 재측정 → 앵커 재계산 + 오버플로 점검
const geo = await p.evaluate(() => {
  const strongs = [...document.querySelectorAll('strong')];
  const dt = strongs.find(e => e.textContent.trim() === 'Date & Time');
  const vn = strongs.find(e => e.textContent.trim() === 'Venue');
  const overflow = [];
  for (const el of document.querySelectorAll('span,div,strong')) {
    if (el.children.length) continue;
    if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
      overflow.push({ text: el.textContent.trim().slice(0, 50), sw: el.scrollWidth, cw: el.clientWidth });
    }
  }
  return {
    dateY: dt ? Math.round(dt.getBoundingClientRect().top + window.scrollY) : null,
    venueY: vn ? Math.round(vn.getBoundingClientRect().top + window.scrollY) : null,
    docH: document.body.scrollHeight, overflow: overflow.slice(0, 12),
  };
});

const top = Math.round(geo.dateY - ANCHOR);
await p.evaluate((y) => window.scrollTo(0, y), top);
await p.waitForTimeout(1400);
const shot = join(OUT, 'seminar-venue-378x888-EN.png');
await p.screenshot({ path: shot, clip: { x: 0, y: 0, width: W, height: CLIP_H } });

console.log(JSON.stringify({ replaced: rep, geo, clipTop: top, out: shot }, null, 1));
await b.close();
