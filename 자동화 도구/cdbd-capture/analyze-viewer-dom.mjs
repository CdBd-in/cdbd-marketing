// viewer 페이지의 카드/섹션 DOM 구조 분석 (정밀 캡처 가능 여부 검증)
// viewer는 공개 페이지 → 로그인 불필요
//
// 실행: node analyze-viewer-dom.mjs <viewer-url>
// 예:   node analyze-viewer-dom.mjs https://www.cdbd.in/templates/invitation/rsvp/viewer

import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const VIEWER_URL = process.argv[2] || 'https://www.cdbd.in/templates/invitation/rsvp/viewer';
const OUT_DIR = resolve('./screenshots/viewer-analysis');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },  // iPhone 14 Pro 모바일 뷰포트
  locale: 'ko-KR',
  deviceScaleFactor: 2,
});
const page = await context.newPage();

try {
  console.log(`▶ viewer 진입: ${VIEWER_URL}`);
  await page.goto(VIEWER_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // 렌더링 대기

  // 전체 페이지 높이
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`   페이지 전체 높이: ${pageHeight}px (뷰포트 844px)`);

  // 카드/섹션 구조 분석 — 큰 블록 element들 추출
  const sections = await page.evaluate(() => {
    const results = [];
    // 후보: 페이지의 직계 카드 컨테이너들 (높이 50px 이상, 폭 충분)
    const candidates = document.querySelectorAll('div, section, article');
    const seen = new Set();
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      const absTop = rect.top + window.scrollY;
      // 의미있는 블록만: 폭 200px+, 높이 80px+, 화면 폭 거의 채움
      if (rect.width > 250 && rect.height > 80 && rect.height < 1200) {
        const text = (el.innerText || '').trim().slice(0, 40).replace(/\n/g, ' ');
        const key = `${Math.round(absTop)}-${Math.round(rect.height)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          y: Math.round(absTop),
          h: Math.round(rect.height),
          w: Math.round(rect.width),
          yPercent: 0, // 나중에 채움
          textPreview: text,
          tag: el.tagName,
          className: (el.className || '').toString().slice(0, 40),
        });
      }
    }
    return results;
  });

  // yPercent 계산
  sections.forEach(s => { s.yPercent = Math.round((s.y / pageHeight) * 100); });
  // y 순 정렬, 상위 25개
  sections.sort((a, b) => a.y - b.y);
  const top = sections.slice(0, 30);

  console.log(`\n   발견된 블록: ${sections.length}개 (상위 30개 출력)`);
  console.log('   y(px) | y% | 높이 | 텍스트 미리보기');
  console.log('   ' + '-'.repeat(70));
  for (const s of top) {
    console.log(`   ${String(s.y).padStart(5)} | ${String(s.yPercent).padStart(3)}% | ${String(s.h).padStart(4)} | ${s.textPreview}`);
  }

  // 전체 페이지 스크린샷
  await page.screenshot({ path: join(OUT_DIR, 'full-page.png'), fullPage: true });
  console.log(`\n   전체 캡처: ${join(OUT_DIR, 'full-page.png')}`);

  // 메타 저장
  writeFileSync(join(OUT_DIR, 'dom-structure.json'), JSON.stringify({ url: VIEWER_URL, pageHeight, sections: top }, null, 2));
  console.log(`   DOM 구조: ${join(OUT_DIR, 'dom-structure.json')}`);

  console.log('\n🎉 분석 완료!');
} catch (err) {
  console.error('❌ 에러:', err.message);
  process.exit(1);
} finally {
  await browser.close();
}
