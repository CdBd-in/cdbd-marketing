// 멀티페이지 템플릿의 모든 페이지를 미리보기 카드 단위로 캡처
// - 우측 미리보기 캐러셀을 "다음" 화살표로 넘기며 각 페이지 캡처
// - 페이저(N/M)로 총 페이지 수 판단
// - deviceScaleFactor=3 고해상도
// 실행: node capture-multipage-all.mjs [slug ...]  (없으면 templates-list.json의 multi 전체)
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const OUT_ROOT = join(homedir(), 'Desktop', 'cdbd 템플릿 스크린샷 (목업용 분할)');
if (!existsSync(OUT_ROOT)) mkdirSync(OUT_ROOT, { recursive: true });

let list = JSON.parse(readFileSync('templates-list.json', 'utf8')).filter(t => t.type === 'multi');
const argv = process.argv.slice(2);
if (argv.length) list = list.filter(t => argv.includes(t.slug) || argv.includes(t.slug.split('/').pop()));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1219 }, locale: 'ko-KR', deviceScaleFactor: 3 });
const page = await ctx.newPage();

// 미리보기 카드 박스(우측 380×580급) 찾아 border/radius 제거 후 좌표 반환
async function getCardBox() {
  return await page.evaluate(() => {
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
}

// 페이저 "N / M" 읽기
async function readPager() {
  return await page.evaluate(() => {
    const m = document.body.innerText.replace(/\s+/g,'').match(/([1-9]\d*)\/([1-9]\d*)/);
    return m ? { cur: +m[1], total: +m[2] } : null;
  });
}

// 미리보기 카드 오른쪽의 "다음" 라운드 화살표 클릭
async function clickNext(cardBox) {
  return await page.evaluate((cb) => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => {
      const c = (b.className||'').toString();
      const r = b.getBoundingClientRect();
      return /rounded-full/.test(c) && r.width>=40 && r.width<=80 && r.height>=40 && r.height<=80
        && r.y > cb.y - 40 && r.y < cb.y + cb.h + 40 && r.x > cb.x;  // 카드 세로범위 + 오른쪽
    });
    if (!btns.length) return false;
    btns.sort((a,b)=>b.getBoundingClientRect().x - a.getBoundingClientRect().x); // 가장 오른쪽 = 다음
    btns[0].click();
    return true;
  }, cardBox);
}

for (const t of list) {
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4500);
    const dir = join(OUT_ROOT, t.slug.replace(/\//g, '__'));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const pager = await readPager();
    const total = pager ? pager.total : 1;
    console.log(`▶ ${t.slug}  총 ${total}페이지`);

    for (let p = 1; p <= total; p++) {
      const box = await getCardBox();
      if (!box) { console.log(`  ✗ p${p} 카드 못 찾음`); break; }
      await page.waitForTimeout(400);
      const fname = String(p).padStart(2, '0') + '.png';
      await page.screenshot({ path: join(dir, fname), clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
      console.log(`  ✓ p${p}/${total} (${box.w}×${box.h})`);
      if (p < total) {
        const ok = await clickNext(box);
        if (!ok) { console.log(`  ✗ p${p} 다음 버튼 못 찾음 — 중단`); break; }
        await page.waitForTimeout(1200);  // 슬라이드 전환 + lazy
      }
    }
  } catch (e) {
    console.log(`✗ ${t.slug} — ${e.message.split('\n')[0]}`);
  }
}
console.log(`\n완료 → ${OUT_ROOT}`);
await browser.close();
