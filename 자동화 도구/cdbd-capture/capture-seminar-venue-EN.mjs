// Figma 1380:5433 (폰 목업 · 일시/장소 밴드) 의 영문 버전 캡처
// 국문 원본과 동일 프레이밍: viewport 378 wide · clip 378x888 · 일시 카드 상단 앵커 72.4px (Figma 배율 422/378 = 1.1164)
// 지도 zoom 17 (= 스케일바 50m) 로 고정 — 국문 캡처와 동일
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const URL = 'https://www.cdbd.in/templates/invitation/seminar/viewer';
const W = 378, CLIP_H = 888, ANCHOR = 72.4, ZOOM = 17;
const OUT = resolve('./screenshots/usecase06/en');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

// KO -> EN. 본문 컬럼 폭 266px 안에서 줄바꿈 없이 떨어지게 길이 조정.
// 톤은 기존 seminar-cover-EN.png(British 철자·VVIP 의전체)과 통일.
const MAP = new Map([
  ['일시', 'Date & Time'],
  ['2026년 6월 24일 화요일', 'Tuesday, 24 June 2026'],
  ['18:00 ~ 20:30', '18:00 – 20:30'],
  ['장소', 'Venue'],
  ['더 시그니처 호텔 서울,', 'The Signature Hotel Seoul,'],
  ['그랜드 볼룸', 'Grand Ballroom'],
  ['*호텔 로비 도착 시 비상등을 켜주시면,', '*On arrival, switch on your hazard'],
  ['사전 등록된 정보를 바탕으로', 'lights and our VIP valet team will'],
  ['VIP 전담 발렛 서비스가 제공됩니다', 'assist you using your registration'],
  ['강남구 테헤란로5길 7 KG Tower', '7 Teheran-ro 5-gil, Gangnam-gu'],
  ['행사 장소 확인하기', 'View Event Location'],
]);

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: W, height: CLIP_H }, locale: 'ko-KR', deviceScaleFactor: 3 });
// naver.maps.Map 생성자 후킹 — 이 페이지는 지도를 2개 만든다(보이는 266x177 / 숨은 380x253).
// 화면에 보이는 쪽만 골라 zoom 을 맞춰야 하므로 생성 시점부터 전부 수집한다.
await c.addInitScript(() => {
  window.__maps = [];
  let _naver;
  const install = (M) => {
    if (!M || M.__w) return M;
    const P = new Proxy(M, { construct(t, a, nt) { const i = Reflect.construct(t, a, nt); window.__maps.push(i); return i; } });
    P.__w = true; return P;
  };
  const patch = (maps) => {
    if (!maps) return;
    let _M = install(maps.Map);
    try { Object.defineProperty(maps, 'Map', { configurable: true, get: () => _M, set: (v) => { _M = install(v); } }); } catch (e) {}
  };
  Object.defineProperty(window, 'naver', {
    configurable: true,
    get: () => _naver,
    set(v) {
      _naver = v;
      if (v && v.maps) patch(v.maps);
      else if (v) { let _m; try { Object.defineProperty(v, 'maps', { configurable: true, get: () => _m, set: (mv) => { _m = mv; patch(mv); } }); } catch (e) {} }
    },
  });
});
const p = await c.newPage();
await p.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(4000);
await p.evaluate(async () => {
  let last = 0, stable = 0;
  while (stable < 3) {
    const h = document.body.scrollHeight;
    if (h === last) stable++; else { stable = 0; last = h; }
    for (let y = 0; y <= h; y += 350) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 130)); }
    await new Promise(r => setTimeout(r, 600));
  }
});

// 1) EN 주입
const rep = await p.evaluate((pairs) => {
  const map = new Map(pairs);
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  const hits = [];
  for (const n of nodes) {
    const t = n.textContent.trim();
    if (map.has(t)) { n.textContent = n.textContent.replace(t, map.get(t)); hits.push(t); }
  }
  return hits.length;
}, [...MAP.entries()]);

// 2) 최종 스크롤 위치로 먼저 이동한 뒤 "보이는" 지도만 zoom 고정 (스크롤 시 리렌더되므로 순서 중요)
const dateY = await p.evaluate(() => {
  const dt = [...document.querySelectorAll('strong')].find(e => e.textContent.trim() === 'Date & Time');
  return dt ? Math.round(dt.getBoundingClientRect().top + window.scrollY) : null;
});
const top = Math.round(dateY - ANCHOR);
await p.evaluate((y) => window.scrollTo(0, y), top);
await p.waitForTimeout(2500);
const zoomOk = await p.evaluate((z) => {
  const vis = window.__maps.filter(m => { try { const el = m.getElement(); return el && document.contains(el) && el.getBoundingClientRect().width > 0; } catch (e) { return false; } });
  vis.forEach(m => m.setZoom(z, false));
  return { total: window.__maps.length, visible: vis.length, zooms: vis.map(m => m.getZoom()) };
}, ZOOM);
await p.waitForTimeout(8000);   // 타일 리렌더 대기

// 3) 줄바꿈(wrap) 검증 — 한 텍스트 노드가 2줄 이상이면 실패로 본다
const check = await p.evaluate((vals) => {
  const set = new Set(vals);
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  const wrapped = [];
  for (const n of nodes) {
    const t = n.textContent.trim(); if (!set.has(t)) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const rects = [...r.getClientRects()].filter(x => x.width > 1);
    if (rects.length > 1) wrapped.push({ text: t, lines: rects.length });
  }
  const dt = [...document.querySelectorAll('strong')].find(e => e.textContent.trim() === 'Date & Time');
  const scale = [...document.querySelectorAll('*')].filter(e => !e.children.length && /^\d+\s*m$/.test(e.textContent.trim())).map(e => e.textContent.trim());
  return { wrapped, dateY: dt ? Math.round(dt.getBoundingClientRect().top + window.scrollY) : null, scale };
}, [...MAP.values()]);

// 4) 클립 캡처 (스크롤은 2)에서 이미 맞춰둠 — 다시 스크롤하면 지도가 zoom 15로 되돌아간다)
const shot = join(OUT, 'seminar-venue-378x888-EN.png');
await p.screenshot({ path: shot, clip: { x: 0, y: 0, width: W, height: CLIP_H } });

console.log(JSON.stringify({ replacedNodes: rep, zoom: zoomOk, wrapped: check.wrapped, scaleBar: check.scale, dateY, clipTop: top, out: shot }, null, 1));
await b.close();
