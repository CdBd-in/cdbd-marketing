// 템플릿 상세 페이지 미리보기 캡처 (이미지 제작 가이드 §2.0a 규칙)
// - /templates/{slug} 상세 페이지 우측 목업 미리보기에서
//   border-radius:0 · border:none 처리 후 내부 콘텐츠 영역만 캡처
// - 원페이지: 폰 프레임 내부 콘텐츠 전체(최상단~하단)
// - 멀티페이지: 1페이지(표지) 미리보기 카드
// 실행: node capture-template-pages.mjs [slug ...]  (없으면 templates-list.json 전체)
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const OUT = join(homedir(), 'Desktop', 'cdbd 템플릿 스크린샷');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let list = JSON.parse(readFileSync('templates-list.json', 'utf8'));
const argv = process.argv.slice(2);
if (argv.length) list = list.filter(t => argv.includes(t.slug) || argv.includes(t.slug.split('/').pop()));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR', deviceScaleFactor: 2 });
const page = await ctx.newPage();

// 폰 미리보기의 내부 스크롤 컨테이너를 끝까지 천천히 스크롤 →
// reveal-on-scroll 애니메이션 + lazy 이미지 전부 트리거한 뒤 맨 위로 복귀
async function revealPhoneContent() {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    // 우측 절반의 스크롤 컨테이너(overflowY auto/scroll, scrollHeight>clientHeight) 탐색
    const vw = window.innerWidth;
    let scroller = null, best = 0;
    for (const el of document.querySelectorAll('div')) {
      const cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowY)) continue;
      if (el.scrollHeight <= el.clientHeight + 50) continue;
      const r = el.getBoundingClientRect();
      if (r.x < vw * 0.4) continue;
      if (el.scrollHeight > best) { best = el.scrollHeight; scroller = el; }
    }
    const target = scroller || document.scrollingElement;
    const step = Math.max(300, (scroller ? scroller.clientHeight : window.innerHeight) * 0.6);
    const max = scroller ? scroller.scrollHeight : document.body.scrollHeight;
    for (let y = 0; y <= max + step; y += step) {
      if (scroller) scroller.scrollTop = y; else window.scrollTo(0, y);
      await sleep(380);
    }
    await sleep(600);
    if (scroller) scroller.scrollTop = 0; else window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

const done = [];
for (const t of list) {
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3500);

    if (t.type === 'single') {
      await revealPhoneContent();
      const found = await page.evaluate(() => {
        const frame = Array.from(document.querySelectorAll('div')).find(d => {
          const c = (d.className||'').toString();
          return c.includes('rounded-[19px]') && c.includes('border-[6px]');
        });
        if (!frame) return { ok:false };
        frame.style.border='none'; frame.style.borderRadius='0'; frame.style.boxShadow='none';
        const inner = frame.firstElementChild || frame;
        inner.setAttribute('data-cap','1');
        // 클리핑 해제: inner의 모든 조상에서 overflow/고정높이 제거 → 폰 콘텐츠 전체가 펼쳐지도록
        let n = inner;
        while (n && n !== document.body) {
          n.style.overflow = 'visible';
          n.style.maxHeight = 'none';
          if (n !== inner) n.style.height = 'auto';
          n = n.parentElement;
        }
        const r = inner.getBoundingClientRect();
        return { ok:true, w:Math.round(r.width), h:Math.round(r.height) };
      });
      await page.waitForTimeout(800);
      if (!found.ok) { console.log(`✗ ${t.slug} — 폰 프레임 못 찾음`); continue; }
      await page.locator('[data-cap="1"]').screenshot({ path: join(OUT, t.slug.replace(/\//g,'__')+'.png') });
      console.log(`✓ ${t.slug}  단일 (${found.w}×${found.h})`);
      done.push(t.slug);
    } else {
      // 멀티페이지: 우측 1페이지 미리보기 카드(≈380×580) 캡처
      await page.waitForTimeout(2500);
      const found = await page.evaluate(() => {
        const vw = window.innerWidth;
        // 우측 절반에서 380±40 × 580±60 박스 중 가장 위(=미리보기 카드 컨테이너) 선택
        const cands = [];
        for (const el of Array.from(document.querySelectorAll('div'))) {
          const r = el.getBoundingClientRect();
          if (r.x > vw*0.45 && r.width>=340 && r.width<=420 && r.height>=520 && r.height<=640) {
            cands.push({ el, r, depth: (function(){let d=0,n=el;while(n){d++;n=n.parentElement;}return d;})() });
          }
        }
        if (!cands.length) return { ok:false };
        // 가장 바깥(=depth 작은) 컨테이너
        cands.sort((a,b)=>a.depth-b.depth);
        const target = cands[0].el;
        // 자신+조상 border-radius/border 제거
        let n = target;
        for (let i=0;i<4 && n;i++){ n.style.borderRadius='0'; n.style.border='none'; n.style.boxShadow='none'; n=n.parentElement; }
        target.setAttribute('data-cap','1');
        const r = target.getBoundingClientRect();
        return { ok:true, w:Math.round(r.width), h:Math.round(r.height) };
      });
      if (!found.ok) { console.log(`✗ ${t.slug} — 멀티 미리보기 못 찾음`); continue; }
      await page.locator('[data-cap="1"]').screenshot({ path: join(OUT, t.slug.replace(/\//g,'__')+'.png') });
      console.log(`✓ ${t.slug}  멀티(1p) (${found.w}×${found.h})`);
      done.push(t.slug);
    }
  } catch (e) {
    console.log(`✗ ${t.slug} — ${e.message.split('\n')[0]}`);
  }
}
console.log(`\n완료: ${done.length}/${list.length} → ${OUT}`);
await browser.close();
