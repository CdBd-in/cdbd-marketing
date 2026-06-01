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

// ============================================================================
// 디자인 가이드 §1.1 (1-2-1. 레이아웃 규칙) 기준 유형 분류
// 우선순위: C(복수) > E(외부주제) > D(주장·이유) > B(에디터) > A(viewer) > 폴백
// ============================================================================

// C 유형 신호 — 화면 둘 이상 (복수 명시)
const C_SIGNALS = [
  // "A와 B" / "A과 B" 패턴 (한글 명사 + 와/과 + 다른 명사)
  /[가-힣]{2,}(과|와)\s*[가-힣]{2,}/,
  // "명함 + 브로셔" 같은 결합 표기
  /\+/,
  // 명시적 키워드
  /결합/, /여러\s*개/, /여러\s*가지/, /여러\s*종류/,
  /페이지\s*빌더/,
  /컬렉션/, /여정/,
  // 카탈로그·룩북은 다중 페이지 속성 → C
  /카탈로그/, /룩북/, /catalog/i, /lookbook/i,
];

// E 유형 신호 — 외부 주제·리스티클 (CdBd 무관)
const E_SIGNALS = [
  // "Best N" 패턴
  /Best\s*\d+/i, /BEST\s*\d+/i, /추천\s*Best/i,
  // 외부 툴·일반 노하우
  /AI\s*툴/, /AI\s*도구/, /AI\s*글쓰기/,
  /무료\s*(사이트|이미지|툴|도구)/,
  /일잘러/, /일\s*잘하는/,
  /업무\s*효율/,
  /노하우/,
  // 리스티클 명시
  /리스티클/,
  /\d+\s*가지\s*(추천|툴|도구|사이트|팁)/,
];

// D 유형 신호 — 개념·주장·비교 (질문·이유·고집형)
const D_SIGNALS = [
  // "왜·이유·진짜 이유"
  /왜\s/, /왜\s*[가-힣]/, /진짜\s*이유/,
  /\d+\s*가지\s*이유/, // "7가지 이유" — D 우선 (E의 "N가지"는 추천형일 때)
  /이유\s*$/, /이유\s*[.?!]/, /\s*이유\s*[가-힣]+/,
  // 비교
  /대신/, /\bvs\.?\b/i, /갈아타/,
  // 고집·주목
  /고집/, /주목/,
  // 문제 제기형 질문
  /아직도\s*[가-힣]+/, /받으세요\s*\?/, /있나요\s*\?/, /하세요\s*\?/,
  // ESG·전환·신뢰 같은 추상 개념
  /ESG/i, /전환율/, /신뢰/,
];

// B 유형 신호 — 에디터·관리 화면 기능
const B_KEYWORDS = [
  "엑셀 업로드", "엑셀 입력", "CRM 업로드", "CRM 자동화", "CRM 마케팅",
  "데이터 업로드", "데이터 입력",
  "팀 공유", "팀 전체에 공유", "팀 협업",
  "통계", "분석 데이터", "데이터 분석",
  "QR",
  "AI 디자인",
  "레이어 추가", "카드 추가", "레이어 추가하기",
  "기능 업데이트", "업데이트",
  "에디터 기능", "관리 화면",
];

// A 유형 신호 — viewer(발행 페이지) 기능
const A_KEYWORDS = [
  "RSVP", "예약 관리", "예약 신청",
  "프로필 링크", "프로필링크",
  "프로모션",
  "상담 신청", "상담 문의",
  "룩북",
  "서명",
  "초대장", "모바일 초대장",
  "명함", "모바일 명함",
  "브로셔", "모바일 브로셔", // 단일 등장 시 A, "과/와 명함" 등은 C에서 잡음
  // 활용·제작 패턴
  "활용법", "사용법",
  // 결말 패턴
  "끝내", "해결",
];

/**
 * 블로그 제목/콘텐츠 분석 → 레이아웃 유형 자동 선택
 * 디자인 가이드 §1.1 기준 — 우선순위: C > E > D > B > A
 *
 * @returns {{ type: string, reason: string }}
 */
function selectLayoutType(title, content) {
  const text = `${title} ${content || ""}`;

  // ──────────────────────────────────────────
  // 1) C 검사 — 화면 둘 이상 (복수 명시)
  // ──────────────────────────────────────────
  for (const pattern of C_SIGNALS) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "C",
        reason: `복수 화면 신호: "${match[0]}" (§1.1 C)`
      };
    }
  }

  // ──────────────────────────────────────────
  // 2) E 검사 — 외부 주제·리스티클 (CdBd 무관)
  // ──────────────────────────────────────────
  for (const pattern of E_SIGNALS) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "E",
        reason: `외부 주제·리스티클: "${match[0]}" (§1.1 E)`
      };
    }
  }

  // ──────────────────────────────────────────
  // 3) D 검사 — 개념·주장·이유 (CdBd 관련 주장)
  // ──────────────────────────────────────────
  for (const pattern of D_SIGNALS) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "D",
        reason: `주장·이유·비교: "${match[0]}" (§1.1 D)`
      };
    }
  }

  // ──────────────────────────────────────────
  // 4) B 검사 — 에디터 기능
  // ──────────────────────────────────────────
  for (const kw of B_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        type: "B",
        reason: `에디터 기능: "${kw}" (§1.1 B)`
      };
    }
  }

  // ──────────────────────────────────────────
  // 5) A 검사 — viewer 발행 페이지 기능
  // ──────────────────────────────────────────
  for (const kw of A_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        type: "A",
        reason: `viewer 기능: "${kw}" (§1.1 A)`
      };
    }
  }

  // ──────────────────────────────────────────
  // 폴백 — 가이드: "화면 없으면 D·E. 끝까지 모호하면..."
  // 질문형 + 미매칭 → 외부 주제 가능성 → E
  // 그 외 → 일단 A (제품 소개 기본)
  // ──────────────────────────────────────────
  if (/\?\s*$/.test(text.trim())) {
    return {
      type: "E",
      reason: "질문형이나 CdBd 기능 신호 없음 → 외부 주제 추정 (폴백)"
    };
  }

  return { type: "A", reason: "기본 (제품 소개 — 폴백)" };
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

    console.log(`[CdBd] 변형 ${i+1} 처리: slotId=${slotId}, name=${name}`);

    const original = await figma.getNodeByIdAsync(slotId);
    if (!original) {
      console.error(`[CdBd] ❌ 슬롯 ${slotId} 찾기 실패 — Figma에서 해당 노드 없음`);
      results.push({ name, error: `slot ${slotId} not found` });
      continue;
    }

    console.log(`[CdBd] ✅ 슬롯 ${slotId} 발견: name="${original.name}", type=${original.type}`);

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
    console.log(`[CdBd] 슬롯 ${slotId} → 유형 "${slotType}" (SLOT_TYPE_MAP)`);

    // 클론된 슬롯 내부 구조 확인 (디버깅)
    const childNames = cloned.findAll ? cloned.findAll(() => true).map(n => `${n.name}(${n.type})`).slice(0, 10) : [];
    console.log(`[CdBd]   내부 자식 노드 (상위 10개): ${childNames.join(", ")}`);

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
  if (!bgSlot) {
    console.error(`[CdBd] ❌ E 유형 BG_SLOT 못 찾음 (parent: ${parentSlot.name})`);
    // 모든 자식 노드 이름 출력 (디버깅)
    const allChildren = parentSlot.findAll(() => true).map(n => n.name).slice(0, 20);
    console.error(`[CdBd]   자식 노드들: ${allChildren.join(", ")}`);
    return { success: false, reason: "BG_SLOT not found" };
  }

  if (!("fills" in bgSlot)) {
    console.error(`[CdBd] ❌ BG_SLOT에 fills 속성 없음 (type: ${bgSlot.type})`);
    return { success: false, reason: "BG_SLOT has no fills" };
  }

  console.log(`[CdBd] ✅ BG_SLOT 발견: ${bgSlot.name} (${bgSlot.type}, ${bgSlot.width}×${bgSlot.height})`);

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
    console.log(`[CdBd]   opacity 0.2 적용됨`);
  }

  if ("strokes" in bgSlot) bgSlot.strokes = [];

  console.log(`[CdBd] ✅ E 유형 배경 이미지 적용 완료`);
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

  // Step 1: 키워드 추출
  const imageData = await generateImageCandidates(blogTitle, blogContent, imageCount);

  // Step 2: UI에 키워드 전달 → UI가 Openverse 검색 + 이미지 다운로드
  figma.ui.postMessage({
    type: "search-openverse",
    keywords: imageData.keywords,
    count: imageData.count,
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

  console.log(`[CdBd] ════════════════════════════════════════`);
  console.log(`[CdBd] 선택된 유형: ${selectedType} (이유: ${layoutDecision.reason})`);
  console.log(`[CdBd] 사용할 슬롯 ID들: ${slotIds.join(", ")}`);
  console.log(`[CdBd] ════════════════════════════════════════`);

  // Step 1.5: 슬롯들이 Figma에 실제로 존재하는지 사전 검증
  await figma.loadAllPagesAsync();
  for (const sid of slotIds) {
    const slotNode = await figma.getNodeByIdAsync(sid);
    if (!slotNode) {
      console.error(`[CdBd] ⚠️ 슬롯 ${sid} (${selectedType} 유형) Figma에 없음!`);
    } else {
      console.log(`[CdBd] ✅ 슬롯 ${sid} 확인: name="${slotNode.name}", type=${slotNode.type}`);
    }
  }

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
/**
 * Openverse API로 이미지 검색 (UI 측에서 실행)
 * Plugin code는 키워드만 전달하고, UI에서 fetch
 */
async function generateImageCandidates(title, content, count) {
  const keywords = extractKeywordsSimple(title, content);
  console.log("[CdBd] 추출된 키워드:", keywords);

  // UI에 키워드 전달 → UI에서 Openverse 검색
  return {
    keywords: keywords,
    searchMode: "openverse",
    count: count
  };
}

/**
 * 간단한 키워드 추출 (JavaScript 판)
 * Python version과 동일한 결과 반환
 */
/**
 * 한글 → 영문 핵심 명사 매핑 (Unsplash/Openverse 검색용)
 * 키워드 점수: 핵심 비즈니스 명사 = 10, 일반 명사 = 5, 형용사 = 2
 */
const KOREAN_NOUN_MAP = {
  // CdBd 제품 (점수 10)
  "초대장": { en: "invitation", score: 10 },
  "명함": { en: "business card", score: 10 },
  "카탈로그": { en: "catalog", score: 10 },
  "브로셔": { en: "brochure", score: 10 },
  "예약": { en: "appointment", score: 10 },
  "결제": { en: "payment", score: 10 },
  "상담": { en: "consulting", score: 10 },
  "문의": { en: "inquiry", score: 10 },
  "프로필링크": { en: "portfolio", score: 10 },
  "포트폴리오": { en: "portfolio", score: 10 },

  // 마케팅·전략 (점수 8)
  "마케팅": { en: "marketing", score: 8 },
  "전략": { en: "strategy", score: 8 },
  "트렌드": { en: "trend", score: 8 },
  "성장": { en: "growth", score: 8 },
  "분석": { en: "analytics", score: 8 },
  "고객": { en: "customer", score: 8 },
  "브랜드": { en: "branding", score: 8 },
  "광고": { en: "advertising", score: 8 },
  "캠페인": { en: "campaign", score: 8 },

  // 기술 (점수 7)
  "AI": { en: "artificial intelligence", score: 9 },
  "인공지능": { en: "artificial intelligence", score: 9 },
  "자동화": { en: "automation", score: 8 },
  "기술": { en: "technology", score: 6 },
  "디자인": { en: "design", score: 7 },
  "데이터": { en: "data", score: 7 },
  "솔루션": { en: "software", score: 6 },
  "도구": { en: "tools", score: 5 },
  "글쓰기": { en: "writing", score: 8 },
  "콘텐츠": { en: "content creation", score: 8 },

  // 비즈니스 (점수 6)
  "기업": { en: "corporate office", score: 6 },
  "비즈니스": { en: "business", score: 6 },
  "스타트업": { en: "startup", score: 7 },
  "회사": { en: "company", score: 5 },
  "팀": { en: "team", score: 6 },
  "리더십": { en: "leadership", score: 7 },
  "협업": { en: "collaboration", score: 7 },

  // 이벤트·네트워킹 (점수 7)
  "이벤트": { en: "event", score: 7 },
  "세미나": { en: "seminar", score: 8 },
  "행사": { en: "conference", score: 7 },
  "네트워킹": { en: "networking", score: 8 },
  "미팅": { en: "meeting", score: 6 },
  "회의": { en: "meeting", score: 6 },

  // 글로벌·모바일 (점수 6)
  "글로벌": { en: "global", score: 6 },
  "모바일": { en: "mobile", score: 6 },
  "해외": { en: "international", score: 6 },

  // 보안·금융 (점수 6)
  "보안": { en: "security", score: 7 },
  "금융": { en: "finance", score: 7 },
  "은행": { en: "banking", score: 7 },

  // 추상 개념 (점수 4)
  "미래": { en: "future technology", score: 5 },
  "혁신": { en: "innovation", score: 5 },
  "성공": { en: "success", score: 4 },
};

/**
 * 블로그 제목/콘텐츠 → 검색 키워드 추출 (점수 기반)
 * - 핵심 명사 우선 (점수 높은 순)
 * - 의미 없는 단어 (조사/형용사/불용어) 제외
 */
function extractKeywordsSimple(title, content) {
  const text = `${title} ${content || ""}`;
  const scored = [];

  // 한글 핵심 명사 매핑 (점수 기반)
  for (const [korean, info] of Object.entries(KOREAN_NOUN_MAP)) {
    if (text.includes(korean)) {
      scored.push({ keyword: info.en, score: info.score, source: korean });
    }
  }

  // 영문 명사 추출 (3글자 이상, 불용어 제외)
  const englishWords = text.toLowerCase().match(/[a-z]{3,}/g) || [];
  const seenEnglish = new Set();
  for (const word of englishWords) {
    if (STOPWORDS.has(word)) continue;
    if (seenEnglish.has(word)) continue;
    seenEnglish.add(word);
    scored.push({ keyword: word, score: 5, source: word });
  }

  // 점수 정렬 (높은 순)
  scored.sort((a, b) => b.score - a.score);

  // 중복 제거 후 상위 3개
  const seen = new Set();
  const result = [];
  for (const item of scored) {
    if (seen.has(item.keyword)) continue;
    seen.add(item.keyword);
    result.push(item.keyword);
    if (result.length >= 3) break;
  }

  // 폴백: 키워드가 없으면 기본
  if (result.length === 0) {
    result.push("business", "office");
  }

  console.log("[CdBd] 키워드 점수:", scored);
  return result;
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
