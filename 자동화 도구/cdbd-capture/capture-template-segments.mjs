// 템플릿 상세 페이지 미리보기를 "목업 1화면 단위(폰 aspect 0.464)"로 분할 캡처
// - 원페이지: 폰 콘텐츠 전체를 380×819(=한 화면) 세그먼트로 분할, 마지막은 하단 정렬(겹침)
// - 멀티페이지: 1페이지(표지) 1장
// - deviceScaleFactor=3 (고해상도) → 세그먼트당 1140×2457px
// 실행: node capture-template-segments.mjs [slug ...]
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const OUT_ROOT = join(homedir(), 'Desktop', 'cdbd 템플릿 스크린샷 (목업용 분할)');
if (!existsSync(OUT_ROOT)) mkdirSync(OUT_ROOT, { recursive: true });

const PHONE_ASPECT = 0.464;          // width / height (이미지 규칙 폰 슬롯)
const SEG_W = 380;
const SEG_H = Math.round(SEG_W / PHONE_ASPECT);  // ≈ 819 (CSS px) = 한 화면

let list = JSON.parse(readFileSync('templates-list.json', 'utf8'));
const argv = process.argv.slice(2);
if (argv.length) list = list.filter(t => argv.includes(t.slug) || argv.includes(t.slug.split('/').pop()));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: SEG_H + 400 }, locale: 'ko-KR', deviceScaleFactor: 3 });
const page = await ctx.newPage();

async function revealPhoneContent() {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
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
    const step = Math.max(300, (scroller ? scroller.clientHeight : window.innerHeight) * 0.6);
    const max = scroller ? scroller.scrollHeight : document.body.scrollHeight;
    for (let y = 0; y <= max + step; y += step) { if (scroller) scroller.scrollTop = y; else window.scrollTo(0, y); await sleep(380); }
    await sleep(600);
    if (scroller) scroller.scrollTop = 0; else window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
}

const summary = [];
for (const t of list) {
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3500);
    const dir = join(OUT_ROOT, t.slug.replace(/\//g, '__'));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    if (t.type === 'single') {
      await revealPhoneContent();
      // 폰 프레임 정리 + 클리핑 해제 + inner를 캡처 대상으로 마킹, 전체 콘텐츠 높이 측정
      const fullH = await page.evaluate(() => {
        const frame = Array.from(document.querySelectorAll('div')).find(d => {
          const c = (d.className||'').toString();
          return c.includes('rounded-[19px]') && c.includes('border-[6px]');
        });
        if (!frame) return null;
        frame.style.border='none'; frame.style.borderRadius='0'; frame.style.boxShadow='none';
        const inner = frame.firstElementChild || frame;
        inner.setAttribute('data-cap','1');
        let n = inner;
        while (n && n !== document.body) { n.style.overflow='visible'; n.style.maxHeight='none'; if (n!==inner) n.style.height='auto'; n = n.parentElement; }
        return inner.scrollHeight;
      });
      if (fullH == null) { console.log(`✗ ${t.slug} — 폰 프레임 못 찾음`); continue; }
      await page.waitForTimeout(400);

      const segH = Math.min(SEG_H, fullH);
      const N = Math.max(1, Math.ceil(fullH / SEG_H));
      for (let i = 0; i < N; i++) {
        let yTop = i * SEG_H;
        if (i === N - 1 && fullH > SEG_H) yTop = fullH - SEG_H;   // 마지막은 하단 정렬(겹침 허용)
        // inner를 segH 높이 스크롤 창으로 만들고 scrollTop으로 세그먼트 노출
        await page.evaluate(({ yTop, segH }) => {
          const inner = document.querySelector('[data-cap="1"]');
          inner.style.height = segH + 'px';
          inner.style.maxHeight = segH + 'px';
          inner.style.overflow = 'hidden';
          inner.scrollTop = yTop;
        }, { yTop, segH });
        await page.waitForTimeout(180);
        const fname = String(i + 1).padStart(2, '0') + '.png';
        await page.locator('[data-cap="1"]').screenshot({ path: join(dir, fname) });
      }
      console.log(`✓ ${t.slug}  단일 → ${N}분할 (전체 ${fullH}px, 세그 ${SEG_W}×${segH})`);
      summary.push({ slug: t.slug, type: 'single', segments: N, totalH: fullH });
    } else {
      await page.waitForTimeout(2500);
      const box = await page.evaluate(() => {
        const vw = window.innerWidth; const cands = [];
        for (const el of Array.from(document.querySelectorAll('div'))) {
          const r = el.getBoundingClientRect();
          if (r.x > vw*0.45 && r.width>=340 && r.width<=420 && r.height>=520 && r.height<=640)
            cands.push({ el, depth: (function(){let d=0,n=el;while(n){d++;n=n.parentElement;}return d;})() });
        }
        if (!cands.length) return null;
        cands.sort((a,b)=>a.depth-b.depth);
        const target = cands[0].el;
        let n = target; for (let i=0;i<4&&n;i++){ n.style.borderRadius='0'; n.style.border='none'; n.style.boxShadow='none'; n=n.parentElement; }
        const r = target.getBoundingClientRect();
        return { x: r.x+window.scrollX, y: r.y+window.scrollY, w: Math.round(r.width), h: Math.round(r.height) };
      });
      if (!box) { console.log(`✗ ${t.slug} — 멀티 미리보기 못 찾음`); continue; }
      await page.evaluate((y)=>window.scrollTo(0, Math.max(0,y-50)), box.y);
      await page.waitForTimeout(200);
      await page.screenshot({ path: join(dir, '01.png'), clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
      console.log(`✓ ${t.slug}  멀티(1p) → 1장 (${box.w}×${box.h})`);
      summary.push({ slug: t.slug, type: 'multi', segments: 1 });
    }
  } catch (e) {
    console.log(`✗ ${t.slug} — ${e.message.split('\n')[0]}`);
  }
}
console.log(`\n완료 → ${OUT_ROOT}`);
console.log('세그먼트 크기:', SEG_W+'×'+SEG_H, 'CSS (×3 =', SEG_W*3+'×'+SEG_H*3, 'px)');
await browser.close();
