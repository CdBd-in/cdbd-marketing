// 카탈로그 viewer를 서로 다른 N개 스크롤 섹션으로 캡처
// 사용: node capture-catalog-sections.mjs <viewer-url> <prefix> [n=3]
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const URL = process.argv[2];
const PREFIX = process.argv[3] || 'catalog';
const N = parseInt(process.argv[4] || '3', 10);
const VW = 390, VH = 838; // A SCREEN aspect 0.4654
const OUT = resolve('./screenshots/catalog'); if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
// 콘텐츠 로드 대기 (이미지·폰트)
await page.waitForTimeout(4000);
await page.evaluate(async () => { await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,500);y+=500;if(y>=document.body.scrollHeight){clearInterval(t);r();}},120);}); });
await page.waitForTimeout(2000);
await page.evaluate(()=>window.scrollTo(0,0));
await page.waitForTimeout(1000);

const H = await page.evaluate(()=>Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
console.error('scrollHeight=', H);
const usable = Math.max(0, H - VH);
for (let i=0;i<N;i++){
  const y = N===1?0:Math.round(usable * i/(N-1));
  await page.evaluate(yy=>window.scrollTo(0,yy), y);
  await page.waitForTimeout(800);
  const f = `${OUT}/${PREFIX}-${i+1}.png`;
  await page.screenshot({ path: f });
  console.error(`#${i+1} y=${y} -> ${f}`);
}
await browser.close();
console.log('done');
