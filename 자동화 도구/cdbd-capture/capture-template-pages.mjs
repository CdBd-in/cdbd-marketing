// 템플릿 상세 페이지 미리보기 캡처 (이미지 제작 가이드 §2.0a 규칙)
// - 각 /templates/{slug} 상세 페이지의 우측 폰 목업 프레임에서
//   border-radius:0 · border:none 처리 후 내부 콘텐츠 영역만 캡처
// 실행: node capture-template-pages.mjs [slug ...]   (인자 없으면 templates-list.json 전체)
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

const done = [];
for (const t of list) {
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3500);

    // lazy-load: 폰 내부 콘텐츠 + 문서 전체 스크롤
    await page.evaluate(async () => {
      await new Promise(r => { let y=0; const t=setInterval(()=>{ window.scrollBy(0,1000); y+=1000; if(y>=document.body.scrollHeight+2000){clearInterval(t);r();} },70); });
      window.scrollTo(0,0);
    });
    await page.waitForTimeout(2500);

    // 폰 목업 프레임 찾기 → border/radius 제거 → 내부 콘텐츠 child 마킹
    const found = await page.evaluate(() => {
      const frame = Array.from(document.querySelectorAll('div')).find(d => {
        const c = (d.className||'').toString();
        return c.includes('rounded-[19px]') && c.includes('border-[6px]');
      });
      if (!frame) return { ok:false };
      frame.style.border = 'none';
      frame.style.borderRadius = '0';
      frame.style.boxShadow = 'none';
      const inner = frame.firstElementChild || frame;
      inner.setAttribute('data-cap', '1');
      const r = inner.getBoundingClientRect();
      return { ok:true, w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!found.ok) { console.log(`✗ ${t.slug} — 폰 프레임 못 찾음`); continue; }

    const fname = t.slug.replace(/\//g, '__') + '.png';
    const outPath = join(OUT, fname);
    await page.locator('[data-cap="1"]').screenshot({ path: outPath });
    console.log(`✓ ${t.slug}  (${found.w}×${found.h})  -> ${fname}`);
    done.push({ slug: t.slug, file: outPath, w: found.w, h: found.h });
  } catch (e) {
    console.log(`✗ ${t.slug} — ${e.message.split('\n')[0]}`);
  }
}
console.log(`\n완료: ${done.length}/${list.length} → ${OUT}`);
await browser.close();
