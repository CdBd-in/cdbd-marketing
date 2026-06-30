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

// 문서 전체를 천천히 끝까지 스크롤 → lazy-load 콘텐츠/이미지 모두 트리거
async function thoroughScroll() {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let last = 0;
    for (let i = 0; i < 80; i++) {
      window.scrollBy(0, 500);
      await sleep(350);
      const h = document.body.scrollHeight;
      if (window.scrollY + window.innerHeight >= h - 5) {
        if (h === last) break; // 더 늘어나지 않으면 종료
        last = h;
      }
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

const done = [];
for (const t of list) {
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3500);

    if (t.type === 'single') {
      await thoroughScroll();
      const found = await page.evaluate(() => {
        const frame = Array.from(document.querySelectorAll('div')).find(d => {
          const c = (d.className||'').toString();
          return c.includes('rounded-[19px]') && c.includes('border-[6px]');
        });
        if (!frame) return { ok:false };
        frame.style.border='none'; frame.style.borderRadius='0'; frame.style.boxShadow='none';
        const inner = frame.firstElementChild || frame;
        inner.setAttribute('data-cap','1');
        const r = inner.getBoundingClientRect();
        return { ok:true, w:Math.round(r.width), h:Math.round(r.height) };
      });
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
