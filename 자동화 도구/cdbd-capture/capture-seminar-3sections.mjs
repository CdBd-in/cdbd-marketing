// CdBd viewer 3개 의미 섹션 자동 캡처 — A 유형 블로그 이미지용
//
// 사용:
//   node capture-seminar-3sections.mjs [viewer-url] [out-prefix]
//
// 예:
//   node capture-seminar-3sections.mjs https://www.cdbd.in/templates/invitation/seminar/viewer seminar
//
// 결과: ./screenshots/blog-image-A/
//   - {prefix}-1-hero.png       (인사말 / 메시지)
//   - {prefix}-2-rsvp.png       (RSVP form / 핵심 정보)
//   - {prefix}-3-contact.png    (문의처 / 액션)
//   - {prefix}-fullpage.png     (전체 풀페이지 참고용)
//   - {prefix}-sections.json    (탐지된 섹션 메타데이터)
//
// 블로그 이미지 A 유형 슬롯 (15:25)의 SCREEN_1/2/3 매칭 비율:
//   - SCREEN aspect ≈ 457/982 = 0.4654
//   - 모바일 viewport: width 390 → height 838 (838 = 390/0.4654)

import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const VIEWER_URL = process.argv[2] || 'https://www.cdbd.in/templates/invitation/seminar/viewer';
const PREFIX = process.argv[3] || 'seminar';

// A 유형 SCREEN 비율 매칭 (457/982 ≈ 0.4654)
const VIEWPORT_W = 390;
const VIEWPORT_H = 838; // 390 / 0.4654

const OUT_DIR = resolve('./screenshots/blog-image-A');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// 섹션 키워드 — 텍스트 매칭으로 의미 영역 자동 탐지
// ⚠️ 같은 키워드가 hero에도 나오는 경우가 많아 (예: "참석하시어" in hero text)
// 페이지 height를 3등분해서 **각 zone에서만** 키워드 검색 (zone 충돌 방지)
const SECTION_HINTS = [
  // Section 1: 인사말 / 메시지 (zone 0: 상단 1/3) — hero 영역
  {
    name: '1-hero',
    zone: [0.0, 0.35], // 페이지 상단 0~35%
    keywords: ['회장님께', '님께', 'Welcome', '환영', '안녕하십니까', '초대합니다'],
    fallbackY: 0,
  },
  // Section 2: 참석 / RSVP / 정보 등록 (zone 1: 중간 1/3)
  {
    name: '2-rsvp',
    zone: [0.30, 0.75], // 페이지 중간 30~75%
    keywords: ['참석 및 사전', '정보 등록', 'RSVP', '참석 여부', '응답하기', '신청하기', 'register', 'reply', '제출'],
    fallbackY: null, // null이면 zone 중앙
  },
  // Section 3: 문의처 / 연락처 (zone 2: 하단 1/3)
  {
    name: '3-contact',
    zone: [0.65, 1.0], // 페이지 하단 65~100%
    keywords: ['문의처', '문의하기', '전화', 'contact', 'CONTACT', '연락처', '주소', '오시는 길'],
    fallbackY: null,
  },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  locale: 'ko-KR',
  deviceScaleFactor: 2,
});
const page = await context.newPage();

try {
  console.log(`▶ viewer 진입: ${VIEWER_URL}`);
  await page.goto(VIEWER_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // 초기 렌더링

  // 풀페이지 스크롤로 lazy-load 트리거 (천천히 스크롤 — 모든 섹션 렌더링)
  console.log('   ⏳ 풀페이지 스크롤 (lazy-load 트리거)...');
  const pageHeight = await page.evaluate(async () => {
    let lastH = 0;
    let stableCount = 0;
    while (stableCount < 3) {
      const currentH = document.body.scrollHeight;
      if (currentH === lastH) {
        stableCount++;
      } else {
        stableCount = 0;
        lastH = currentH;
      }
      // 천천히 스크롤
      for (let y = 0; y <= currentH; y += 300) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 200));
      }
      await new Promise(r => setTimeout(r, 800));
    }
    return document.body.scrollHeight;
  });
  console.log(`   ✓ 페이지 전체 높이: ${pageHeight}px`);

  // 전체 페이지 캡처 (참고용)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  const fullPath = join(OUT_DIR, `${PREFIX}-fullpage.png`);
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log(`   📸 전체 캡처: ${fullPath}`);

  // 섹션 자동 탐지 — zone-restricted 키워드 매칭
  console.log('\n▶ 의미 섹션 자동 탐지 (zone-restricted)');
  const detectedSections = [];
  for (const hint of SECTION_HINTS) {
    const zoneStart = Math.round(pageHeight * hint.zone[0]);
    const zoneEnd = Math.round(pageHeight * hint.zone[1]);

    const matchedY = await page.evaluate(({ keywords, zoneStart, zoneEnd }) => {
      // 모든 텍스트 노드 순회, zone 안에서만 키워드 검색
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const text = (node.textContent || '').trim();
        if (!text) continue;
        for (const kw of keywords) {
          if (text.includes(kw)) {
            let el = node.parentElement;
            while (el && el.offsetHeight < 50) el = el.parentElement;
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            const absY = rect.top + window.scrollY;
            // zone 범위 안에 있어야만 매칭
            if (absY >= zoneStart && absY <= zoneEnd) {
              return Math.max(0, Math.round(absY - 40));
            }
          }
        }
      }
      return null;
    }, { keywords: hint.keywords, zoneStart, zoneEnd });

    detectedSections.push({
      name: hint.name,
      zone: hint.zone,
      zoneRange: [zoneStart, zoneEnd],
      keywords: hint.keywords,
      y: matchedY,
      matched: matchedY !== null,
    });
    console.log(`   ${hint.name} (zone ${zoneStart}~${zoneEnd}px): ${matchedY !== null ? `y=${matchedY} (✓ matched)` : '(미탐지 — zone 중앙 fallback)'}`);
  }

  // 미탐지 섹션은 해당 zone 중앙으로 fallback
  for (let i = 0; i < detectedSections.length; i++) {
    if (detectedSections[i].y === null) {
      const [zStart, zEnd] = detectedSections[i].zoneRange;
      detectedSections[i].y = Math.round((zStart + zEnd) / 2);
      detectedSections[i].fallbackUsed = true;
      console.log(`   ${detectedSections[i].name}: fallback y=${detectedSections[i].y} (zone 중앙)`);
    }
  }

  // 각 섹션 캡처
  console.log('\n▶ 섹션별 viewport 캡처');
  const results = [];
  for (const sec of detectedSections) {
    // y가 너무 끝에 가까우면 보정
    const maxY = Math.max(0, pageHeight - VIEWPORT_H);
    const y = Math.min(sec.y, maxY);

    await page.evaluate(yPos => window.scrollTo(0, yPos), y);
    await page.waitForTimeout(1500); // 스크롤 후 lazy-load 마무리

    const outPath = join(OUT_DIR, `${PREFIX}-${sec.name}.png`);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: VIEWPORT_W, height: VIEWPORT_H } });
    results.push({ ...sec, capturedY: y, file: outPath });
    console.log(`   📸 ${sec.name} (y=${y}): ${outPath}`);
  }

  // 메타 저장
  const meta = {
    viewer_url: VIEWER_URL,
    pageHeight,
    viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
    aspect_target: VIEWPORT_W / VIEWPORT_H,
    sections: results,
  };
  writeFileSync(join(OUT_DIR, `${PREFIX}-sections.json`), JSON.stringify(meta, null, 2));
  console.log(`\n   📄 메타: ${join(OUT_DIR, `${PREFIX}-sections.json`)}`);

  console.log('\n✅ 완료!');
  console.log('\n다음 단계 — Claude에게 캡처 결과 전달:');
  console.log(`  "자동화 도구/cdbd-capture/screenshots/blog-image-A/ 안의 ${PREFIX}-1-hero.png, ${PREFIX}-2-rsvp.png, ${PREFIX}-3-contact.png 3장을 블로그 이미지 A 유형(15:25)에 적용해줘"`);
} catch (err) {
  console.error('❌ 에러:', err.message);
  console.error(err.stack);
  process.exit(1);
} finally {
  await browser.close();
}
