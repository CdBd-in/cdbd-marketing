import { chromium } from 'playwright';
const URL = 'https://www.cdbd.in/templates/catalog/newarrival/viewer';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport:{width:390,height:844}, locale:'ko-KR', deviceScaleFactor:2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil:'networkidle' });
await page.waitForTimeout(5000);

// 페이지네이션/네비 후보 탐색
const info = await page.evaluate(() => {
  const out = { pager:[], buttons:[], swiper:false };
  // "1/4" 텍스트 요소
  document.querySelectorAll('*').forEach(el=>{
    const t=(el.childNodes.length===1&&el.textContent||'').trim();
    if(/^\d+\s*\/\s*\d+$/.test(t)) out.pager.push({text:t, cls:(el.className||'').toString().slice(0,50), tag:el.tagName});
  });
  // 버튼/화살표 후보
  document.querySelectorAll('button, [role="button"], [aria-label], svg').forEach(el=>{
    const al=el.getAttribute&&el.getAttribute('aria-label')||'';
    const cls=(el.className||'').toString();
    if(/next|prev|arrow|이전|다음|right|left/i.test(al+cls)){
      out.buttons.push({tag:el.tagName, aria:al, cls:cls.slice(0,50)});
    }
  });
  // swiper 존재 여부
  out.swiper = !!document.querySelector('.swiper, [class*="swiper"], [class*="carousel"], [class*="slide"]');
  out.slideClasses = [...new Set([...document.querySelectorAll('[class*="slide"],[class*="swiper"],[class*="carousel"]')].map(e=>(e.className||'').toString().slice(0,60)))].slice(0,10);
  out.pageH = document.body.scrollHeight;
  return out;
});
console.log(JSON.stringify(info,null,2));
await browser.close();
