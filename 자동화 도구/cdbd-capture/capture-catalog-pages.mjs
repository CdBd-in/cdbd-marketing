// 카탈로그 viewer 페이지를 넘겨가며 각 페이지 캡처 (가로 스와이프 캐러셀)
// 실행: node capture-catalog-pages.mjs <viewer-url> <outPrefix>
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const URL = process.argv[2] || 'https://www.cdbd.in/templates/catalog/newarrival/viewer';
const PREFIX = process.argv[3] || 'newarrival';
const OUT = resolve('./screenshots/catalog-pages');
if(!existsSync(OUT)) mkdirSync(OUT,{recursive:true});

const browser = await chromium.launch({ headless:true });
const ctx = await browser.newContext({ viewport:{width:390,height:844}, locale:'ko-KR', deviceScaleFactor:2, hasTouch:true });
const page = await ctx.newPage();

const readPager = async () => page.evaluate(()=>{
  for(const el of document.querySelectorAll('div')){
    const t=(el.textContent||'').trim();
    if(/^\d+\/\d+$/.test(t) && el.children.length===0) return t;
  }
  // fallback: any element
  for(const el of document.querySelectorAll('*')){
    const t=(el.textContent||'').trim();
    if(/^\d+\/\d+$/.test(t)) return t;
  }
  return null;
});

const swipeNext = async () => {
  const w=390,h=844;
  // 터치 스와이프 (오른쪽→왼쪽)
  await page.touchscreen.tap(w/2, h/2).catch(()=>{});
  await page.mouse.move(w*0.8, h*0.5);
  await page.mouse.down();
  await page.mouse.move(w*0.2, h*0.5, {steps:15});
  await page.mouse.up();
  await page.waitForTimeout(1200);
};

try {
  console.log('▶', URL);
  await page.goto(URL,{waitUntil:'networkidle'});
  await page.waitForTimeout(5000);

  let pager = await readPager();
  console.log('초기 페이저:', pager);
  const total = pager ? parseInt(pager.split('/')[1]) : 4;
  console.log('총 페이지:', total);

  const captured = [];
  for(let i=1;i<=total;i++){
    const before = await readPager();
    await page.waitForTimeout(800);
    const path = join(OUT, `${PREFIX}-p${i}.png`);
    await page.screenshot({ path });
    console.log(`  ✅ p${i} 캡처 (페이저 ${before})`);
    captured.push(path);
    if(i<total){
      await swipeNext();
      const after = await readPager();
      console.log(`     스와이프 후 페이저: ${after}`);
      if(after===before){
        // 키보드 시도
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1200);
        const after2 = await readPager();
        console.log(`     키보드 후 페이저: ${after2}`);
      }
    }
  }
  console.log('완료:', captured.length, '페이지');
} catch(e){
  console.error('❌', e.message);
} finally {
  await browser.close();
}
