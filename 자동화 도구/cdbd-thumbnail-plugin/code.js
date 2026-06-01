// CdBd 블로그 썸네일 자동 제작 Plugin v4
// vault: 1. 디자인 가이드
// v4 변경: 공식 목업 컴포넌트 인스턴스 + TITLE/SUBTITLE 자동 줄바꿈 (width 300)

// 강조색 (1-1 §2)
const GREEN = { r: 77 / 255, g: 233 / 255, b: 139 / 255 };
const PURPLE = { r: 143 / 255, g: 128 / 255, b: 255 / 255 };
const WHITE = { r: 1, g: 1, b: 1 }; // E 유형 텍스트 색상

// 텍스트 자동 줄바꿈 임계 (1-1 §3.텍스트 작성 규칙) — 유형별
// A·B·C·E: TITLE 300 / SUBTITLE 285 (목업이 우측에 있어 텍스트 영역 좁음)
// D: TITLE 350 / SUBTITLE 350 (3D 아이콘이 더 작아 텍스트 영역 넓음 — 2026-05-31)
const TITLE_MAX_WIDTH = 300;
const SUBTITLE_MAX_WIDTH = 285;
const TITLE_MAX_WIDTH_D = 350;
const SUBTITLE_MAX_WIDTH_D = 350;
const TEXT_MAX_WIDTH = TITLE_MAX_WIDTH; // 하위 호환

// 공식 목업 컴포넌트 ID (1-3-1 §1.1.a)
// 2026-05-31: 사용자가 1:1368 폐기 후 새 마스터 75:34 등록 (베젤 5px + cornerRadius 26)
const DEFAULT_MOCKUP_ID = "75:34"; // 원페이지 목업-1 (신규)

// 페이지 분리 (2026-05-31)
const SLOT_TEMPLATE_PAGE_ID = "1:1245"; // 슬롯 16종 원본 (clone 소스, 건드리지 않음)
const OUTPUT_PAGE_ID = "26:2"; // "💻 AI 블로그 썸네일 제작" — 자동 생성된 안 출력 위치

// Microlink 캡쳐 외곽 검정 padding을 Figma 내장 crop으로 잘라내는 변환 매트릭스
// (사용자 ref frame 83:186에서 추출 — 위 8.59% / 좌우 4.61% / 아래 2.34% crop)
// 원본 v8 캡쳐(검정 padding 포함)에 CROP scaleMode와 함께 사용.
const VIEWER_CAPTURE_TRANSFORM = [
  [0.9078340530395508, 0, 0.04608295112848282],
  [0, 0.8907168507575989, 0.08593140542507172],
];

// 슬롯 ID → 이미지 유형 매핑 ([[1-2-1. 레이아웃 규칙]] §2.1)
// A: 목업 / B: 목업+에디터 / C: 멀티 목업 / D: 3D 아이콘 / E: 배경
const SLOT_TYPE_MAP = {
  // A. 목업
  "1:1266": "A", "1:1269": "A", "1:1251": "A", "1:1246": "A",
  // B. 목업+에디터
  "1:1300": "B", "1:1308": "B", "1:1304": "B", "1:1314": "B",
  // C. 멀티 목업
  "1:1257": "C", "1:1287": "C",
  // D. 3D 아이콘
  "1:1254": "D", "1:1282": "D", "1:1274": "D", "1:1277": "D",
  // E. 배경
  "1:1262": "E", "1:1294": "E",
};

// 하단 텍스트 슬롯 — 텍스트 채운 후 y=410-height 자동 보정 (1-2-1 §2.2)
const BOTTOM_SLOT_IDS = new Set([
  "1:1251", "1:1246", // A 하단/하단·서브
  "1:1304", "1:1314", // B 하단/하단·서브
  "1:1274", "1:1277", // D 하단/하단·서브
]);
const TEXT_BOTTOM_Y = 410; // 슬롯 하단(450) - bottom padding(40)

// 중앙 텍스트 슬롯 — E 유형 (1-2-1 §3.5)
const CENTER_TEXT_SLOT_IDS = new Set([
  "1:1262", "1:1294", // E 중앙/중앙·서브
]);
const TEXT_CENTER_HEIGHT_TOTAL = 450; // 배경(E) 중앙 정렬용

// ============================================================================
// 레이아웃 유형 자동 분류 (v5.0)
// 디자인 가이드 §1-2-1, §5.4 기준
// ============================================================================

// 각 유형별 슬롯 ID (서브타이틀 있음/없음, 상단/하단 변형 포함)
const TYPE_TO_SLOTS = {
  // A. 목업 — 제품 소개·기본
  "A": ["1:1266", "1:1269", "1:1251", "1:1246"],
  // B. 목업+에디터 — 편집기·도구 사용법
  "B": ["1:1300", "1:1308", "1:1304", "1:1314"],
  // C. 멀티 목업 — 비교·여러 제품
  "C": ["1:1257", "1:1287"],
  // D. 3D 아이콘 — 특정 기능 강조 (1순위)
  "D": ["1:1254", "1:1282", "1:1274", "1:1277"],
  // E. 배경 — 리스티클·트렌드·추천
  "E": ["1:1262", "1:1294"],
};

// 유형별 키워드 매칭 규칙 (우선순위: D > B > C > E > A)
const TYPE_KEYWORDS = {
  // D 유형 — §5.4 1순위 특정 기능 매칭
  "D": [
    "초대장", "invitation",
    "명함", "business card",
    "카탈로그", "catalog", "브로셔", "brochure",
    "예약", "booking", "reservation",
    "결제", "payment",
    "상담", "문의", "consultation",
    "서명", "계약", "signature",
    "프로필링크", "profile link",
    "분석", "analytics",
    "성장", "growth",
  ],
  // B 유형 — 편집기·도구·제작
  "B": [
    "에디터", "editor",
    "편집기", "편집",
    "만들기", "제작", "create",
    "꾸미기", "디자인하기",
    "사용법", "튜토리얼", "tutorial",
  ],
  // C 유형 — 비교·여러 제품
  "C": [
    "비교", "compare",
    " vs ", "vs.", "대비",
    "차이점", "차이",
    "선택", "고르기",
  ],
  // E 유형 — 리스티클·트렌드·추천
  "E": [
    "트렌드", "trend",
    "전략", "strategy",
    "팁", "tip",
    "추천", "best",
    "리스티클",
    "가이드", "guide",  // (D보다 우선순위 낮음 - 특정 기능 없을 때만)
  ],
};

/**
 * 블로그 제목/콘텐츠 분석 → 레이아웃 유형 자동 선택
 * 우선순위: D > B > C > E > A (기본값)
 *
 * @returns {{ type: string, reason: string }}
 */
function selectLayoutType(title, content) {
  const text = `${title} ${content || ""}`.toLowerCase();

  // 1) D 유형 — 특정 기능 매칭 (1순위)
  for (const kw of TYPE_KEYWORDS["D"]) {
    if (text.includes(kw.toLowerCase())) {
      return { type: "D", reason: `"${kw}" 기능 매칭 (§5.4 1순위)` };
    }
  }

  // 2) B 유형 — 편집기·도구
  for (const kw of TYPE_KEYWORDS["B"]) {
    if (text.includes(kw.toLowerCase())) {
      return { type: "B", reason: `"${kw}" 편집·제작 콘텐츠` };
    }
  }

  // 3) C 유형 — 비교
  for (const kw of TYPE_KEYWORDS["C"]) {
    if (text.includes(kw.toLowerCase())) {
      return { type: "C", reason: `"${kw}" 비교 콘텐츠` };
    }
  }

  // 4) E 유형 — 리스티클 패턴 (N가지·N개 + 키워드)
  if (/\d+\s*(가지|개)/.test(text)) {
    return { type: "E", reason: "리스티클 패턴 (N가지/N개)" };
  }
  for (const kw of TYPE_KEYWORDS["E"]) {
    if (text.includes(kw.toLowerCase())) {
      return { type: "E", reason: `"${kw}" 리스티클·트렌드 콘텐츠` };
    }
  }

  // 5) 이유·방법 — 리스티클 (D 매칭 안 됐을 때만)
  if (/이유|방법|why|how/i.test(text)) {
    return { type: "E", reason: "이유/방법 패턴 (리스티클)" };
  }

  // 6) 기본값 — A 유형 (제품 소개)
  return { type: "A", reason: "기본 (제품 소개)" };
}

figma.showUI(__html__, { width: 500, height: 700 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-variants") {
    try {
      const result = await createVariants(msg.payload);
      figma.ui.postMessage({ type: "result", success: true, data: result });
      figma.notify(`✅ ${result.length}안 생성 완료`);
    } catch (err) {
      figma.ui.postMessage({ type: "result", success: false, error: err.message });
      figma.notify(`❌ 오류: ${err.message}`, { error: true });
    }
  } else if (msg.type === "generate-images-ai") {
    try {
      // UI에 이미지 fetch 요청만 보냄 (실제 생성은 images-fetched에서)
      await createVariantsFromAI(msg.payload);
    } catch (err) {
      figma.ui.postMessage({ type: "result", success: false, error: err.message });
      figma.notify(`❌ 오류: ${err.message}`, { error: true });
    }
  } else if (msg.type === "images-fetched") {
    try {
      const result = await createVariantsFromImageData(msg.payload);
      figma.ui.postMessage({ type: "result", success: true, data: result });
      figma.notify(`✅ ${result.length}안 생성 완료`);
    } catch (err) {
      figma.ui.postMessage({ type: "result", success: false, error: err.message });
      figma.notify(`❌ 오류: ${err.message}`, { error: true });
    }
  }
};

async function createVariants(payload) {
  const { title, subtitle, emphasis, variants } = payload;

  await figma.loadAllPagesAsync();
  // 슬롯 템플릿 페이지 (clone 소스, 건드리지 않음)
  const templatePage =
    figma.root.children.find((p) => p.id === SLOT_TEMPLATE_PAGE_ID) ||
    figma.root.children.find((p) => p.name.includes("슬롯"));
  // 출력 페이지 (생성 안들이 들어갈 곳)
  let outputPage = figma.root.children.find((p) => p.id === OUTPUT_PAGE_ID);
  if (!outputPage) {
    // fallback — 출력 페이지 없으면 템플릿 페이지 (옛 동작)
    outputPage = templatePage || figma.currentPage;
  }
  await figma.setCurrentPageAsync(outputPage);

  // 2026-05-31: 강조어는 항상 Purple (서브 유무 무관). SUBTITLE 색은 fillText에서 별도 GREEN 적용.
  const emphasisColor = PURPLE;
  const results = [];
  const baseX = -3500;
  const baseY = 4000;

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const { slotId, imageHash, name } = v;
    const mockupId = v.mockupId || DEFAULT_MOCKUP_ID;

    const original = await figma.getNodeByIdAsync(slotId);
    if (!original) {
      results.push({ name, error: `slot ${slotId} not found` });
      continue;
    }

    const newName = name || `안${i + 1}_${slotId}`;

    // 동명 잔재 안 자동 삭제 (재실행 시 누적 방지) — 출력 페이지 기준
    const existing = outputPage.children.filter((c) => c.name === newName);
    existing.forEach((c) => c.remove());

    const cloned = original.clone();
    cloned.name = newName;
    cloned.x = baseX + (i % 4) * 650;
    cloned.y = baseY + Math.floor(i / 4) * 500;
    // clipsContent 강제 — 베젤 위·아래 cut-off 블리드 ([[1-2-1]] §3 슬롯 스펙)
    if ("clipsContent" in cloned) cloned.clipsContent = true;
    outputPage.appendChild(cloned); // 출력 페이지에 클론 추가

    // 1) 유형 판단
    const slotType = SLOT_TYPE_MAP[slotId] || "A";

    // E 유형: BG_SLOT (배경) + 보조 VISUAL_SLOT (선택)
    if (slotType === "E") {
      applyBackground(cloned, imageHash);
      // 보조 아이콘 (데이터에 secondaryImageHash 있으면 사용)
      if (v.secondaryImageHash) {
        applySecondaryIcon(cloned, v.secondaryImageHash);
      }
    } else {
      // A·B·C·D 유형: VISUAL_SLOT 처리
      const visualSlot = cloned.findOne((n) => n.name === "VISUAL_SLOT");
      if (visualSlot) {
        if (slotType === "D") {
          // D. 3D 아이콘 — 목업 컴포넌트 없이 VISUAL_SLOT에 직접 PNG fill
          // (1-2-1 §3.3: w·h 260, contain — 블리드 X)
          apply3DIcon(visualSlot, imageHash);
        } else {
          // A·B·C — 공식 목업 컴포넌트 인스턴스 + 내부 #FAFAFA rect에 fill
          const result = await applyMockup(cloned, visualSlot, mockupId, imageHash);
          if (!result.success) {
            // 폴백: 목업 못 찾으면 VISUAL_SLOT에 직접 fill
            if ("fills" in visualSlot) {
              visualSlot.fills = [
                { type: "IMAGE", imageHash: imageHash, scaleMode: "FILL" },
              ];
              if ("strokes" in visualSlot) visualSlot.strokes = [];
            }
          }
        }
      }
    }

    // 3) 텍스트 처리 (유형별)
    if (slotType === "E") {
      // E 유형: 텍스트 흰색 고정, 강조색 없음 (1-1 §2, 1-2-1 §1.2)
      await fillText(cloned, "TITLE", title, null, WHITE, false, slotType);
      if (subtitle) {
        await fillText(cloned, "SUBTITLE", subtitle, null, WHITE, true, slotType);
      }
      // 중앙 정렬 (세로)
      adjustTextCenterE(cloned, slotId);
    } else {
      // A·B·C·D 유형
      // 4) TITLE 텍스트 + 자동 줄바꿈 + 강조어 (slotType 전달 → 유형별 폭)
      await fillText(cloned, "TITLE", title, emphasis, emphasisColor, false, slotType);

      // 5) SUBTITLE 텍스트 (전체 그린) + 자동 줄바꿈
      if (subtitle) {
        await fillText(cloned, "SUBTITLE", subtitle, null, GREEN, true, slotType);
      }

      // 6) 하단 슬롯 — 텍스트 줄 수 변화에 따른 y 자동 보정 (1-2-1 §2.2)
      if (BOTTOM_SLOT_IDS.has(slotId)) {
        // TEXT_BLOCK이 있으면 그것의 y / 없으면 TITLE의 y
        const tb = cloned.findOne((n) => n.name === "TEXT_BLOCK");
        const title_node = cloned.findOne((n) => n.type === "TEXT" && n.name === "TITLE");
        const target = tb || title_node;
        if (target) {
          target.y = TEXT_BOTTOM_Y - target.height;
        }
      }
    }

    results.push({ name: cloned.name, id: cloned.id });
  }

  // 첫 안으로 뷰포트 이동
  if (results.length > 0 && !results[0].error) {
    const firstNode = await figma.getNodeByIdAsync(results[0].id);
    if (firstNode) figma.viewport.scrollAndZoomIntoView([firstNode]);
  }

  return results;
}

/**
 * D 유형 — 3D 아이콘 (Thiings PNG) VISUAL_SLOT에 직접 fill
 * (목업 컴포넌트 없음. 1-2-1 §3.3: contain — FIT scaleMode로 잘림 방지)
 */
function apply3DIcon(visualSlot, imageHash) {
  if (!("fills" in visualSlot)) return { success: false, reason: "no fills" };
  visualSlot.fills = [
    { type: "IMAGE", imageHash: imageHash, scaleMode: "FIT" },
  ];
  if ("strokes" in visualSlot) visualSlot.strokes = [];
  return { success: true };
}

/**
 * 공식 목업 컴포넌트 인스턴스 생성 + VISUAL_SLOT 위치에 배치 + 내부 #FFFFFF rect에 imageHash fill
 */
async function applyMockup(parentSlot, visualSlot, mockupId, imageHash) {
  const mockupComponent = await figma.getNodeByIdAsync(mockupId);
  if (
    !mockupComponent ||
    (mockupComponent.type !== "COMPONENT" &&
      mockupComponent.type !== "COMPONENT_SET")
  ) {
    return { success: false, reason: "mockup component not found" };
  }

  // 인스턴스 생성
  const instance = mockupComponent.createInstance();

  // VISUAL_SLOT 폭에 맞춰 비례 rescale — 자식(#FAFAFA·VECTOR) 비율 유지
  // (resize는 자식 위치 깨지지만 rescale은 자식까지 비례 → 안전)
  if (visualSlot.width && instance.width) {
    const scale = visualSlot.width / instance.width;
    if (Math.abs(scale - 1) > 0.001) {
      instance.rescale(scale);
    }
  }

  // 슬롯 좌상단에 정렬 (rescale 후 폭이 visualSlot.width와 동일하므로 가로 중앙 = visualSlot.x)
  instance.x = visualSlot.x;
  instance.y = visualSlot.y;

  // 인스턴스 자체도 clipsContent (베젤 child들 cut-off 보장)
  if ("clipsContent" in instance) instance.clipsContent = true;

  parentSlot.appendChild(instance);

  // 내부 흰색/거의 흰색 rect 찾기 (#FFFFFF·#FAFAFA 등) — 1-3-1 §1.1.a
  // Vector 베젤은 VECTOR 타입이므로 RECTANGLE/FRAME만 허용
  const screen = instance.findOne((n) => {
    if (n.type !== "RECTANGLE" && n.type !== "FRAME") return false;
    if (!("fills" in n) || !Array.isArray(n.fills) || n.fills.length === 0)
      return false;
    const f = n.fills[0];
    if (f.type !== "SOLID") return false;
    // 회색 톤 (R/G/B 차이 ≤ 0.05) + 밝기 ≥ 0.9 (흰색/거의 흰색)
    const { r, g, b } = f.color;
    const isGrayTone =
      Math.abs(r - g) < 0.05 && Math.abs(g - b) < 0.05 && Math.abs(r - b) < 0.05;
    return isGrayTone && r >= 0.9 && g >= 0.9 && b >= 0.9;
  });

  if (screen) {
    // CROP + imageTransform — Microlink 캡쳐 외곽 검정 padding을 Figma 단에서 잘라냄
    // (Python 측에서 픽셀 처리할 필요 없음, 원본 캡쳐 그대로 사용 가능)
    screen.fills = [{
      type: "IMAGE",
      imageHash: imageHash,
      scaleMode: "CROP",
      imageTransform: VIEWER_CAPTURE_TRANSFORM,
    }];
  }

  // 빈 VISUAL_SLOT placeholder 제거
  visualSlot.remove();

  return { success: true, instanceId: instance.id, screenId: screen && screen.id };
}

/**
 * 텍스트 노드를 찾아 텍스트 채우기 + 자동 줄바꿈
 * slotType: "A"·"B"·"C"·"D"·"E" — 유형별 폭 분기 (D는 350, 나머지는 300/285)
 */
async function fillText(parent, nodeName, text, emphasis, color, isSubtitle, slotType) {
  // 1) 이름으로 찾기
  let node = parent.findOne((n) => n.name === nodeName && n.type === "TEXT");

  // 2) 폴백: TEXT_BLOCK 안에서 추정
  if (!node) {
    const textBlock = parent.findOne((n) => n.name === "TEXT_BLOCK");
    if (textBlock) {
      const texts = textBlock.children.filter((c) => c.type === "TEXT");
      if (isSubtitle) {
        // SUBTITLE은 TEXT_BLOCK 내 첫 번째
        node = texts.length >= 2 ? texts[0] : null;
      } else {
        // TITLE은 TEXT_BLOCK 내 두 번째 (서브 다음), 또는 단일
        node = texts.length >= 2 ? texts[1] : texts[0];
      }
    }
  }

  // 3) 폴백 2: 슬롯 직속 TEXT 중 큰 것 (TITLE)
  if (!node && !isSubtitle) {
    const texts = parent.children.filter((n) => n.type === "TEXT");
    node = texts.sort((a, b) => b.height - a.height)[0];
  }

  if (!node) return;

  await figma.loadFontAsync(node.fontName);

  // 폭 강제 + textAutoResize HEIGHT (자동 줄바꿈)
  // D 유형: 350 / 나머지: TITLE 300 · SUBTITLE 285
  const isD = slotType === "D";
  const maxWidth = isD
    ? (isSubtitle ? SUBTITLE_MAX_WIDTH_D : TITLE_MAX_WIDTH_D)
    : (isSubtitle ? SUBTITLE_MAX_WIDTH : TITLE_MAX_WIDTH);
  node.textAutoResize = "HEIGHT";
  node.resize(maxWidth, node.height);
  node.characters = text;

  // 전체 색상 적용 (서브타이틀 또는 E 유형 TITLE)
  if (isSubtitle || (slotType === "E" && !isSubtitle)) {
    node.fills = [{ type: "SOLID", color: color }];
  }

  // 강조어 색상 적용 (A·B·C·D 유형 TITLE)
  if (emphasis && slotType !== "E") {
    const idx = text.indexOf(emphasis);
    if (idx !== -1) {
      node.setRangeFills(idx, idx + emphasis.length, [
        { type: "SOLID", color: color },
      ]);
    }
  }
}

/**
 * E 유형 — 배경 이미지 처리 (BG_SLOT)
 * (1-2-1 §3.5: BG_SLOT 전체 600×450, opacity 20%)
 */
function applyBackground(parentSlot, imageHash) {
  const bgSlot = parentSlot.findOne((n) => n.name === "BG_SLOT");
  if (!bgSlot || !("fills" in bgSlot)) return { success: false };

  bgSlot.fills = [
    {
      type: "IMAGE",
      imageHash: imageHash,
      scaleMode: "FILL",
    },
  ];

  // opacity 20% 적용
  if ("opacity" in bgSlot) {
    bgSlot.opacity = 0.2;
  }

  if ("strokes" in bgSlot) bgSlot.strokes = [];

  return { success: true };
}

/**
 * E 유형 — 보조 이미지 처리 (VISUAL_SLOT, 선택)
 * (1-2-1 §3.5: 우측 x320/y110/w·h 230)
 */
function applySecondaryIcon(parentSlot, imageHash) {
  const visualSlot = parentSlot.findOne((n) => n.name === "VISUAL_SLOT");
  if (!visualSlot || !("fills" in visualSlot)) return { success: false };

  visualSlot.fills = [
    {
      type: "IMAGE",
      imageHash: imageHash,
      scaleMode: "FIT",
    },
  ];

  if ("strokes" in visualSlot) visualSlot.strokes = [];

  return { success: true };
}

/**
 * E 유형 — 텍스트 수직 중앙 정렬
 * (1-2-1 §3.5: 텍스트 좌측 세로 중앙, 전부 흰색)
 */
function adjustTextCenterE(parentSlot, slotId) {
  // TEXT_BLOCK 또는 TITLE 찾기
  let textContainer = parentSlot.findOne((n) => n.name === "TEXT_BLOCK");
  if (!textContainer) {
    textContainer = parentSlot.findOne((n) => n.type === "TEXT" && n.name === "TITLE");
  }

  if (!textContainer) return;

  // 총 높이 계산
  const totalHeight = textContainer.height;

  // 수직 중앙 정렬: (전체 높이 - 텍스트 높이) / 2
  const newY = (TEXT_CENTER_HEIGHT_TOTAL - totalHeight) / 2;
  textContainer.y = newY;
}

/**
 * ============================================================================
 * AI 이미지 자동 생성 파이프라인 (v5.0)
 * ============================================================================
 * 블로그 제목/콘텐츠 → 키워드 추출 → Unsplash 이미지 검색 → Figma 업로드 → 자동 생성
 */

/**
 * AI 이미지로 썸네일 생성 (메인 파이프라인) — UI 측 fetch 사용
 * 1. 키워드 추출 + URL 생성
 * 2. UI에 URL 리스트 전달 → UI가 fetch (리다이렉트 자동 처리)
 * 3. UI가 바이너리 데이터를 plugin으로 전달
 * 4. plugin이 figma.createImage() 호출 → imageHash 추출
 * 5. E type 자동 생성
 */
async function createVariantsFromAI(payload) {
  const { blogTitle, blogContent, imageCount } = payload;

  // Step 1: 이미지 URL 후보 생성
  const imageData = await generateImageCandidates(blogTitle, blogContent, imageCount);

  if (!imageData.images || imageData.images.length === 0) {
    throw new Error("이미지 후보 생성 실패");
  }

  // Step 2: UI에 URL 리스트 전달 → UI가 fetch
  figma.ui.postMessage({
    type: "fetch-images",
    urls: imageData.images,
    blogTitle,
    blogContent
  });

  // UI가 처리하므로 여기서는 빈 결과 반환 (실제 처리는 메시지 핸들러에서)
  return [];
}

/**
 * UI에서 받은 이미지 바이너리 데이터로 썸네일 생성
 * — 블로그 제목으로 레이아웃 유형 자동 선택 → 해당 유형 슬롯들로 베리에이션 생성
 */
async function createVariantsFromImageData(payload) {
  const { blogTitle, blogContent, imagesData } = payload;

  // Step 1: 레이아웃 유형 자동 선택
  const layoutDecision = selectLayoutType(blogTitle, blogContent);
  const selectedType = layoutDecision.type;
  const slotIds = TYPE_TO_SLOTS[selectedType];

  console.log(`[CdBd] 선택된 유형: ${selectedType} (이유: ${layoutDecision.reason})`);
  console.log(`[CdBd] 사용할 슬롯: ${slotIds.join(", ")}`);

  // 진행 상황 UI 업데이트
  figma.ui.postMessage({
    type: "layout-selected",
    layoutType: selectedType,
    reason: layoutDecision.reason,
    slotCount: slotIds.length
  });

  // Step 2: 각 바이너리를 Figma에 등록 → imageHash 추출
  const variants = [];
  let slotIndex = 0;

  for (let i = 0; i < imagesData.length; i++) {
    const item = imagesData[i];
    if (!item.success) {
      console.warn(`이미지 ${item.name} 다운로드 실패:`, item.error);
      continue;
    }

    try {
      const uint8Array = new Uint8Array(item.bytes);
      const image = figma.createImage(uint8Array);

      // 슬롯을 순환하면서 베리에이션 생성
      const slotId = slotIds[slotIndex % slotIds.length];
      slotIndex++;

      variants.push({
        slotId: slotId,
        imageHash: image.hash,
        name: `${selectedType}_${item.name}_${slotId}`
      });
    } catch (e) {
      console.warn(`이미지 ${item.name} 등록 실패:`, e.message);
    }
  }

  if (variants.length === 0) {
    throw new Error("유효한 이미지가 없음 (네트워크/CORS 확인 필요)");
  }

  // Step 3: 자동 선택된 유형으로 생성
  const createPayload = {
    title: blogTitle,
    subtitle: blogContent ? blogContent.split('\n')[0] : "",
    // E 유형은 강조어 없음 / 나머지는 첫 3-5글자를 강조어로 (간단한 휴리스틱)
    emphasis: selectedType === "E" ? "" : extractEmphasis(blogTitle),
    variants: variants
  };

  return await createVariants(createPayload);
}

/**
 * 제목에서 강조어 자동 추출 (간단 휴리스틱)
 * 가장 의미있어 보이는 명사구 추출 (3-7글자)
 */
function extractEmphasis(title) {
  // 따옴표나 괄호 안의 내용 우선
  const quoted = title.match(/[「『"'\[\(]([^」』"'\]\)]+)[」』"'\]\)]/);
  if (quoted) return quoted[1];

  // 숫자+가지/개 패턴 (예: "7가지 이유")
  const listicle = title.match(/(\d+가지\s*\S+)/);
  if (listicle) return listicle[1].trim();

  // 마지막 3-7글자 명사구 (한글)
  const words = title.split(/\s+/);
  const lastWord = words[words.length - 1];
  if (lastWord && lastWord.length >= 3 && lastWord.length <= 8) {
    return lastWord;
  }

  // 기본: 빈 문자열 (강조 없음)
  return "";
}

/**
 * Python image_generator.py 호출
 * (또는 온라인 API 호출)
 */
async function generateImageCandidates(title, content, count) {
  // Lorem Flickr (키워드 기반) + Picsum (랜덤 fallback)
  const keywords = extractKeywordsSimple(title, content);
  console.log("[CdBd] 추출된 키워드:", keywords);

  const images = [];

  // Lorem Flickr: 키워드 기반 이미지 (https://loremflickr.com/600/450/keyword)
  for (let i = 0; i < count; i++) {
    const keyword = keywords[i % keywords.length];
    const variant = Math.floor(i / keywords.length);

    // 변형: 캐시 무효화 + 키워드 조합
    let url;
    if (variant === 0) {
      url = `https://loremflickr.com/600/450/${encodeURIComponent(keyword)}?lock=${i}`;
    } else if (variant === 1) {
      url = `https://loremflickr.com/600/450/${encodeURIComponent(keyword + ",business")}?lock=${i + 100}`;
    } else {
      url = `https://loremflickr.com/600/450/${encodeURIComponent(keyword + ",abstract")}?lock=${i + 200}`;
    }

    images.push({
      url: url,
      keyword: keyword,
      name: `안${i + 1}_${keyword}${variant > 0 ? "_v" + variant : ""}`,
      fallbackUrl: `https://picsum.photos/seed/cdbd${i}/600/450` // Picsum fallback (랜덤)
    });
  }

  return {
    keywords: keywords,
    images: images.slice(0, count),
    count: Math.min(images.length, count)
  };
}

/**
 * 간단한 키워드 추출 (JavaScript 판)
 * Python version과 동일한 결과 반환
 */
function extractKeywordsSimple(title, content) {
  // 한글 키워드 → 영문 Unsplash 검색어 매핑
  const KOREAN_TO_ENGLISH = {
    "AI": "AI",
    "ai": "AI",
    "인공지능": "artificial intelligence",
    "자동화": "automation",
    "초대장": "invitation",
    "명함": "business card",
    "카탈로그": "catalog",
    "포트폴리오": "portfolio",
    "예약": "booking",
    "결제": "payment",
    "보안": "security",
    "분석": "analytics",
    "마케팅": "marketing",
    "성장": "growth",
    "글로벌": "global",
    "모바일": "mobile",
    "글쓰기": "writing",
    "콘텐츠": "content",
    "블로그": "blog",
    "비즈니스": "business",
    "기업": "corporate",
    "스타트업": "startup",
    "전략": "strategy",
    "디자인": "design",
    "기술": "technology",
    "데이터": "data",
    "고객": "customer",
    "서비스": "service",
    "브랜드": "brand",
    "광고": "advertising",
    "이벤트": "event",
    "세미나": "seminar",
    "회의": "meeting",
    "프레젠테이션": "presentation",
    "네트워킹": "networking",
    "협업": "collaboration",
    "팀": "team",
    "리더십": "leadership",
    "트렌드": "trend",
    "혁신": "innovation",
    "미래": "future",
    "도구": "tool",
    "솔루션": "solution",
  };

  const text = `${title} ${content}`;
  const found = [];

  // 1) 한글 키워드 → 영문 매핑
  for (const [korean, english] of Object.entries(KOREAN_TO_ENGLISH)) {
    if (text.includes(korean) && !found.includes(english)) {
      found.push(english);
    }
  }

  // 2) 영문 키워드 직접 추출 (3글자 이상)
  const englishWords = text.toLowerCase().match(/[a-z]{3,}/g) || [];
  for (const word of englishWords) {
    if (!STOPWORDS.has(word) && !found.includes(word)) {
      found.push(word);
    }
  }

  // 키워드가 없으면 기본 폴백
  if (found.length === 0) {
    found.push("business", "abstract");
  }

  return found.slice(0, 5);
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "are", "was", "be", "been",
  "이", "그", "저", "것", "수", "등", "들", "및", "또는", "만",
]);

/**
 * 이미지 URL에서 바이너리 다운로드 & Figma에 업로드
 * → imageHash 반환
 */
async function downloadAndCreateImage(imageUrl) {
  try {
    // Step 1: 이미지 다운로드
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Step 2: Figma에 이미지 추가 & 해시 추출
    const image = figma.createImage(uint8Array);
    return image.hash;
  } catch (e) {
    throw new Error(`이미지 다운로드 실패: ${e.message}`);
  }
}
