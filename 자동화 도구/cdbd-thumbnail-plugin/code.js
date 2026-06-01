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
// Thiings 데코 카탈로그 (디자인 가이드 §4.1 + decorations.json 기준)
// 컴포넌트 페이지: ✨ 컴포넌트 (1:1343) → 보조 이미지_데코 section (4:117)
// ============================================================================

// sparkle 1-4 (§4.1: 다양성 확보용, 자동화에서 랜덤 또는 회전 사용)
const SPARKLE_VARIANTS = [
  { slug: "sparkle1", figma_id: "4:141", thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-SJcxLxIC8lH8u7d9CvcOGIULgEz7wX.png" },
  { slug: "sparkle2", figma_id: "4:166", thiings_url: null }, // variant
  { slug: "sparkle3", figma_id: "4:165", thiings_url: null },
  { slug: "sparkle4", figma_id: "4:164", thiings_url: null },
];

// ───────────────────────────────────────────────────────────
// §5.4 CdBd 기능명 → D 자산 매핑 (최우선 ⭐⭐⭐)
// ───────────────────────────────────────────────────────────
const FUNCTION_TO_DECORATION = [
  {
    keywords: ["초대장", "invitation", "RSVP", "참석"],
    slug: "envelope",
    figma_id: null, // 컴포넌트화 대기 (1d12e23b... 다운로드 완료)
    thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-lp9vjuXTCqeB9yhVXBoBmyqdy8e9jv.png",
    note: "§5.4 초대장 1순위",
  },
  {
    keywords: ["예약", "예약 관리", "예약 시스템", "일정 조율", "appointment", "reservation"],
    slug: "calendar",
    figma_id: "14:4",
    thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-ij7GEZhfmzLNlLgDJVhkST8FIm5rJV.png",
    note: "§5.4 예약 1순위",
  },
  {
    keywords: ["AI", "ai", "인공지능", "자동화", "automation", "스마트", "smart"],
    slug: "magic-wand",
    figma_id: "4:167",
    thiings_url: null, // Figma 컴포넌트만 있음
    note: "§5.4 AI·자동화 1순위",
  },
  // §5.4 미등록 자산 (slug만 매칭하고 다운로드 불가 시 다음 후보로)
  {
    keywords: ["명함"],
    slug: "card",
    figma_id: null,
    thiings_url: null,
    note: "§5.4 명함 1순위 (미등록)",
  },
  {
    keywords: ["카탈로그", "브로셔", "catalog", "brochure"],
    slug: "book",
    figma_id: null,
    thiings_url: null,
    note: "§5.4 카탈로그·브로셔 1순위 (미등록)",
  },
  {
    keywords: ["상담", "문의", "consultation", "inquiry"],
    slug: "chat-bubble",
    figma_id: null,
    thiings_url: null,
    note: "§5.4 상담·문의 1순위 (미등록)",
  },
  {
    keywords: ["서명", "계약", "signature", "contract"],
    slug: "pen",
    figma_id: null,
    thiings_url: null,
    note: "§5.4 서명·계약 1순위 (미등록)",
  },
  {
    keywords: ["분석", "통계", "성장", "매출", "성공", "analytics"],
    slug: "chart-up",
    figma_id: null,
    thiings_url: null,
    note: "§5.4 분석·성장 1순위 (미등록)",
  },
  {
    keywords: ["결제", "금융", "payment", "finance"],
    slug: "credit-card",
    figma_id: null,
    thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-xylXWxjRoBYdaH9IPOx1080olvl5Ur.png",
    note: "결제·금융",
  },
];

// ───────────────────────────────────────────────────────────
// §5.1 톤·정서 → 데코 매핑 (1a 매칭 없을 때 fallback)
// ───────────────────────────────────────────────────────────
const TONE_TO_DECORATION = [
  {
    keywords: ["프리미엄", "VIP", "vip", "고급", "premium"],
    slug: "crown",
    figma_id: "14:2",
    thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-o82qImf0LoNhDhTch7C2G2CwyVj9Ud.png",
    note: "§5.1 프리미엄 1순위",
  },
  {
    keywords: ["안전", "보안", "신뢰", "security", "safe", "trust"],
    slug: "shield",
    figma_id: "14:3",
    thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-CZxT18DNf12Vjv8rrZv8V0tddRi9Xu.png",
    note: "§5.1 안전·보안 1순위",
  },
  {
    keywords: ["글로벌", "해외", "다국어", "global", "international"],
    slug: "globe",
    figma_id: "14:5",
    thiings_url: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-KBUXl6AhDj2IsoZnozHL39yX1acqa5.png",
    note: "§5.1 글로벌 1순위",
  },
  // 미등록 (slug만)
  { keywords: ["팀", "협업", "함께", "공유"], slug: "hands", figma_id: null, thiings_url: null, note: "§5.1 팀·협업 (미등록)" },
  { keywords: ["아이디어", "팁", "노하우", "tips"], slug: "lightbulb", figma_id: null, thiings_url: null, note: "§5.1 아이디어 (미등록)" },
  { keywords: ["런칭", "출시", "신규", "오픈"], slug: "rocket", figma_id: null, thiings_url: null, note: "§5.1 런칭 (미등록)" },
];

/**
 * 데코 자동 선택 (가이드 §5.4 → §5.1 → sparkle 폴백 순서)
 *
 * 가이드 §5.5: "기능명 매칭이 없을 때만 §5.1 톤 매핑 사용"
 * 가이드 §4.1: "sparkle 4종: 자동화에서 랜덤 또는 회전 사용"
 *
 * @returns {{ slug, figma_id, thiings_url, note }}
 */
function selectDecoration(blogTitle, blogContent = "") {
  const text = `${blogTitle} ${blogContent}`.toLowerCase();

  // ─── 1순위: §5.4 CdBd 기능명 매칭 ⭐⭐⭐ ───
  for (const deco of FUNCTION_TO_DECORATION) {
    for (const kw of deco.keywords) {
      if (text.includes(kw.toLowerCase())) {
        // 다운로드 또는 인스턴스화 가능한지 확인
        if (deco.thiings_url || deco.figma_id) {
          console.log(`[CdBd] 데코 매칭: "${kw}" → ${deco.slug} (${deco.note})`);
          return deco;
        } else {
          console.warn(`[CdBd] 매칭됐지만 미등록: ${deco.slug} (${deco.note})`);
          // 다음 후보 계속 탐색
        }
      }
    }
  }

  // ─── 2순위: §5.1 톤 매칭 ───
  for (const deco of TONE_TO_DECORATION) {
    for (const kw of deco.keywords) {
      if (text.includes(kw.toLowerCase())) {
        if (deco.thiings_url || deco.figma_id) {
          console.log(`[CdBd] 톤 매칭: "${kw}" → ${deco.slug} (${deco.note})`);
          return deco;
        } else {
          console.warn(`[CdBd] 톤 매칭됐지만 미등록: ${deco.slug} (${deco.note})`);
        }
      }
    }
  }

  // ─── 폴백: sparkle 1-4 랜덤 (§4.1 다양성) ───
  const sparkle = SPARKLE_VARIANTS[Math.floor(Math.random() * SPARKLE_VARIANTS.length)];
  console.log(`[CdBd] 데코 폴백: ${sparkle.slug} (sparkle 1-4 랜덤)`);
  return {
    slug: sparkle.slug,
    figma_id: sparkle.figma_id,
    thiings_url: sparkle.thiings_url,
    note: "§5.1 일반 강조 (기본값)",
  };
}

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
      // 보조 아이콘 (Thiings hash 있으면 fill, 없으면 Figma 컴포넌트 인스턴스화)
      if (v.secondaryImageHash || v.secondaryFigmaId) {
        await applySecondaryIcon(cloned, v.secondaryImageHash, v.secondaryFigmaId);
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

  // 자동 줄바꿈 완전 차단: textAutoResize를 NONE으로 변경 후 텍스트 적용
  // 우리의 \n만 줄바꿈으로 작동, Figma 자동 줄바꿈 (어절 중간 잘림) 방지
  // D 유형: 350 / 나머지: TITLE 300 · SUBTITLE 285
  const isD = slotType === "D";
  const maxWidth = isD
    ? (isSubtitle ? SUBTITLE_MAX_WIDTH_D : TITLE_MAX_WIDTH_D)
    : (isSubtitle ? SUBTITLE_MAX_WIDTH : TITLE_MAX_WIDTH);

  // 1) 텍스트 먼저 설정 (\n 적용)
  node.characters = text;
  // 2) WIDTH_AND_HEIGHT로 자동 줄바꿈 차단 (텍스트에 맞춰 노드 크기 자동 조정)
  node.textAutoResize = "WIDTH_AND_HEIGHT";

  console.log(`[CdBd] fillText 적용: "${text.replace(/\n/g, "/")}" (텍스트 노드 크기: ${node.width}×${node.height})`);

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
 * 가이드 1-2-1 §3.5: 우측 x320/y110/w·h 230 (보조 3D)
 * 가이드 1-3-1 §1.2.a: 보조 이미지 위치 알고리즘
 *
 * @param parentSlot - E 유형 슬롯 (1:1262 또는 1:1294)
 * @param imageHash - Thiings 다운로드 이미지 (있으면 사용)
 * @param figmaComponentId - Figma 컴포넌트 ID (thiings_url 없을 때 인스턴스화 폴백)
 */
async function applySecondaryIcon(parentSlot, imageHash, figmaComponentId) {
  const visualSlot = parentSlot.findOne((n) => n.name === "VISUAL_SLOT");
  if (!visualSlot) {
    console.warn(`[CdBd] E 유형 VISUAL_SLOT 없음 (parent: ${parentSlot.name})`);
    return { success: false, reason: "no VISUAL_SLOT" };
  }

  // 1순위: imageHash 있으면 fill (Thiings 다운로드)
  if (imageHash && "fills" in visualSlot) {
    visualSlot.fills = [
      { type: "IMAGE", imageHash: imageHash, scaleMode: "FIT" },
    ];
    if ("strokes" in visualSlot) visualSlot.strokes = [];
    console.log(`[CdBd] ✅ 보조 아이콘 fill 완료 (Thiings)`);
    return { success: true, method: "thiings_fill" };
  }

  // 2순위: figma_id 있으면 컴포넌트 인스턴스화 (가이드 §1.2.a)
  if (figmaComponentId) {
    try {
      // 컴포넌트 페이지 로드 보장
      await figma.loadAllPagesAsync();
      const component = await figma.getNodeByIdAsync(figmaComponentId);

      if (!component) {
        console.warn(`[CdBd] 데코 컴포넌트 ${figmaComponentId} 노드 없음`);
        return { success: false, reason: "component not found" };
      }
      if (component.type !== "COMPONENT" && component.type !== "COMPONENT_SET") {
        console.warn(`[CdBd] 데코 노드 ${figmaComponentId} 타입이 컴포넌트 아님: ${component.type}`);
        return { success: false, reason: `not a component (${component.type})` };
      }

      // 인스턴스 생성 — COMPONENT_SET이면 첫 번째 default variant 사용
      const sourceComponent = component.type === "COMPONENT_SET" ? component.defaultVariant : component;
      const instance = sourceComponent.createInstance();

      // VISUAL_SLOT 위치·크기에 맞춰 배치 (1-2-1 §3.5: 우측 x320/y110/w·h 230)
      instance.x = visualSlot.x;
      instance.y = visualSlot.y;
      if (instance.width && visualSlot.width) {
        const scale = visualSlot.width / instance.width;
        if (Math.abs(scale - 1) > 0.001) {
          instance.rescale(scale);
        }
      }

      parentSlot.appendChild(instance);

      // 빈 VISUAL_SLOT placeholder 제거
      visualSlot.remove();

      console.log(`[CdBd] ✅ 보조 아이콘 인스턴스화 완료 (Figma 컴포넌트 ${figmaComponentId})`);
      return { success: true, method: "figma_instance" };
    } catch (e) {
      console.error(`[CdBd] 컴포넌트 인스턴스화 실패: ${e.message}`);
      return { success: false, reason: e.message };
    }
  }

  console.warn(`[CdBd] 보조 아이콘 자산 없음 (Thiings URL · Figma ID 둘 다 없음)`);
  return { success: false, reason: "no asset" };
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

  // Step 2: 레이아웃 유형 미리 판단 (E면 보조 아이콘 필요)
  const layoutDecision = selectLayoutType(blogTitle, blogContent);
  console.log(`[CdBd] 유형 사전 판단: ${layoutDecision.type}`);

  // Step 3: 유형별 지원 여부 확인
  // 가이드 §5.3: 자동화 우선순위 — E·D 우선 (Thiings 인프라만 필요)
  // A·B·C는 cdbd.in viewer/에디터 캡처가 필요 (Microlink/Playwright 인프라 → 추후 작업)
  if (["A", "B", "C"].includes(layoutDecision.type)) {
    figma.notify(`⚠️ ${layoutDecision.type} 유형은 cdbd.in viewer 캡처 필요 — 현재는 E·D만 완전 자동화 지원`);
    console.warn(`[CdBd] ⚠️ ${layoutDecision.type} 유형은 추후 작업 (Microlink/Playwright 인프라 필요)`);
  }

  // E·D 유형 — 가이드 §5.4 §5.1 데코 자동 선택
  let decoration = null;
  if (layoutDecision.type === "E" || layoutDecision.type === "D") {
    decoration = selectDecoration(blogTitle, blogContent);
    console.log(`[CdBd] 데코 선택: ${decoration.slug} (${decoration.note})`);
    console.log(`[CdBd]   thiings_url: ${decoration.thiings_url || "(없음)"}`);
    console.log(`[CdBd]   figma_id: ${decoration.figma_id || "(없음)"}`);
  }

  // Step 4: UI에 키워드 + 데코 정보 전달
  figma.ui.postMessage({
    type: "search-openverse",
    keywords: imageData.keywords,
    count: imageData.count,
    decoration: decoration, // Thiings URL과 figma_id 포함
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
  const { blogTitle, blogContent, imagesData, decoration } = payload;

  // Step 1: 레이아웃 유형 자동 선택
  const layoutDecision = selectLayoutType(blogTitle, blogContent);
  const selectedType = layoutDecision.type;

  // 가이드 1-2-1 §1.2: 서브타이틀 유무에 따라 슬롯 결정 (두 슬롯 섞지 않음)
  // E 유형: 서브 없음 → 1:1262만 / 서브 있음 → 1:1294만
  const hasSubtitle = blogContent && blogContent.trim().length > 0;
  let slotIds = TYPE_TO_SLOTS[selectedType];

  if (selectedType === "E") {
    slotIds = hasSubtitle ? ["1:1294"] : ["1:1262"];
    console.log(`[CdBd] E 유형 슬롯 선택: ${slotIds[0]} (서브타이틀 ${hasSubtitle ? "있음" : "없음"})`);
  }

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

  // Step 2: 메인 이미지와 아이콘을 페어로 처리
  // E 유형은 isMain 이미지를 배경, isIcon 이미지를 보조 아이콘으로 사용
  const variants = [];
  let slotIndex = 0;

  // 메인 이미지와 아이콘을 분리
  const mainImages = imagesData.filter(item => item.success && item.isMain);
  const iconImages = imagesData.filter(item => item.success && item.isIcon);
  const otherImages = imagesData.filter(item => item.success && !item.isMain && !item.isIcon);

  console.log(`[CdBd] 메인 이미지: ${mainImages.length}, 아이콘: ${iconImages.length}, 기타: ${otherImages.length}`);

  // 모든 이미지를 Figma에 등록 (hash 추출)
  const mainHashes = [];
  const iconHashes = [];

  for (const item of mainImages) {
    try {
      const uint8Array = new Uint8Array(item.bytes);
      const image = figma.createImage(uint8Array);
      mainHashes.push({ hash: image.hash, name: item.name, keyword: item.keyword });
    } catch (e) {
      console.warn(`메인 이미지 등록 실패:`, e.message);
    }
  }

  for (const item of iconImages) {
    try {
      const uint8Array = new Uint8Array(item.bytes);
      const image = figma.createImage(uint8Array);
      iconHashes.push({ hash: image.hash, name: item.name, keyword: item.keyword });
    } catch (e) {
      console.warn(`아이콘 이미지 등록 실패:`, e.message);
    }
  }

  // 기타 이미지도 메인으로 처리 (E 유형 외에서 사용)
  for (const item of otherImages) {
    try {
      const uint8Array = new Uint8Array(item.bytes);
      const image = figma.createImage(uint8Array);
      mainHashes.push({ hash: image.hash, name: item.name, keyword: item.keyword });
    } catch (e) {
      console.warn(`기타 이미지 등록 실패:`, e.message);
    }
  }

  // 메인 이미지로 베리에이션 생성, 아이콘은 페어링
  for (let i = 0; i < mainHashes.length; i++) {
    const mainImg = mainHashes[i];
    const slotId = slotIds[slotIndex % slotIds.length];
    slotIndex++;

    const variant = {
      slotId: slotId,
      imageHash: mainImg.hash,
      name: `${selectedType}_${mainImg.name}_${slotId}`
    };

    // E 유형이면 보조 아이콘 페어링
    // 1) Thiings 다운로드된 아이콘 우선 사용 (imageHash로 fill)
    // 2) Thiings URL 없으면 Figma 컴포넌트 ID 전달 (인스턴스화)
    if (selectedType === "E") {
      if (iconHashes.length > 0) {
        const iconImg = iconHashes[i % iconHashes.length];
        variant.secondaryImageHash = iconImg.hash;
        console.log(`[CdBd]   변형 ${i+1}: 배경(${mainImg.keyword}) + Thiings 아이콘(${iconImg.keyword})`);
      } else if (decoration && decoration.figma_id) {
        // Thiings URL 없는 데코 (예: magic-wand)는 Figma 컴포넌트로 인스턴스화
        variant.secondaryFigmaId = decoration.figma_id;
        console.log(`[CdBd]   변형 ${i+1}: 배경(${mainImg.keyword}) + Figma 컴포넌트 ${decoration.slug} (${decoration.figma_id})`);
      } else {
        console.log(`[CdBd]   변형 ${i+1}: 배경(${mainImg.keyword}) — 보조 아이콘 없음`);
      }
    }

    variants.push(variant);
  }

  if (variants.length === 0) {
    throw new Error("유효한 이미지가 없음 (네트워크/CORS 확인 필요)");
  }

  // Step 3: 강조 키워드 자동 추출 (가이드 1-1 §3)
  // E 유형도 강조 키워드는 추출하지만, fillText에서 색상 적용 X (전부 흰색)
  const emphasis = extractEmphasis(blogTitle);
  console.log(`[CdBd] 추출된 강조 키워드: "${emphasis}"`);

  // Step 4: 의미 단위 줄 나누기 (가이드 1-1 §3)
  // 가이드: "한 줄 한글 8-10자 이내, 가장 적은 줄 수를 택한다 (보통 2-4줄)"
  // 폭 300px = 한글 8.33em이라 maxLine=8.0이 한계
  // textAutoResize=WIDTH_AND_HEIGHT라 자동 줄바꿈 없음 → 우리 \n만 적용
  const maxLine = selectedType === "D" ? 9.5 : 8.0;
  const formattedTitle = autoLineBreak(blogTitle, emphasis, maxLine);
  console.log(`[CdBd] 줄 나누기 결과 (maxLine=${maxLine}):`);
  console.log(formattedTitle);
  const lines = formattedTitle.split("\n");
  console.log(`[CdBd] 줄 수: ${lines.length}, 각 줄 시각 폭(em): [${lines.map(l => countDisplayLen(l).toFixed(1)).join(", ")}]`);

  const formattedSubtitle = blogContent
    ? autoLineBreak(blogContent.split('\n')[0], "", maxLine)
    : "";

  // Step 5: 자동 선택된 유형으로 생성
  const createPayload = {
    title: formattedTitle,
    subtitle: formattedSubtitle,
    emphasis: emphasis,  // E는 fillText 내부에서 색상 무시
    variants: variants
  };

  return await createVariants(createPayload);
}

// ============================================================================
// 강조 키워드 자동 추출 (가이드 1-1 §3 우선순위)
// 1순위: 제품·기능명 > 2순위: 가치 제안 동사 > 3순위: 차별점 > 4순위: 핵심 명사
// ============================================================================

// 1순위: CdBd 제품·기능명 (마케팅 본질)
const EMPHASIS_PRIORITY_1_PRODUCT = [
  "CdBd 모바일 명함", "CdBd 모바일 브로셔", "CdBd 모바일 초대장",
  "모바일 명함", "모바일 브로셔", "모바일 초대장", "모바일 카탈로그",
  "비공개 초대장", "디지털 카탈로그",
  "프로필 링크", "프로필링크",
  "예약 관리", "상담 신청",
  "페이지 빌더", "AI 디자인",
  "RSVP", "QR",
  "CdBd",
];

// 2순위: 가치 제안 동사·결과
const EMPHASIS_PRIORITY_2_VALUE = [
  "끝내기", "끝내세요", "끝내",
  "사로잡는", "사로잡기",
  "해결",
  "기능 업데이트", "업데이트",
  "갈아타기", "갈아타야", "갈아타",
  "공유하는 방법", "공유하기",
];

// 3순위: 차별점·혜택 (형용사·부사)
const EMPHASIS_PRIORITY_3_DIFF = [
  "안전하고", "안전한",
  "예쁘게", "예쁜",
  "무료로", "무료",
  "대신",
  "직접",
  "한 번에",
];

// 4순위: 핵심 명사·개념
const EMPHASIS_PRIORITY_4_NOUN = [
  "진짜 이유", "고집하는 이유",
  /\d+가지\s*이유/,  // "7가지 이유"
  /Best\s*\d+/i,    // "Best 18"
  /\d+가지/,         // "5가지"
];

/**
 * 제목에서 강조 키워드 자동 추출 (가이드 §3 기준)
 * 우선순위: 제품·기능 > 가치 제안 > 차별점 > 핵심 명사
 */
function extractEmphasis(title) {
  // 1순위: 제품·기능명 (정확히 일치)
  for (const kw of EMPHASIS_PRIORITY_1_PRODUCT) {
    if (title.includes(kw)) return kw;
  }

  // 2순위: 가치 제안 동사
  for (const kw of EMPHASIS_PRIORITY_2_VALUE) {
    if (title.includes(kw)) return kw;
  }

  // 3순위: 차별점·혜택
  for (const kw of EMPHASIS_PRIORITY_3_DIFF) {
    if (title.includes(kw)) return kw;
  }

  // 4순위: 핵심 명사·개념 (정규식 또는 문자열)
  for (const kw of EMPHASIS_PRIORITY_4_NOUN) {
    if (kw instanceof RegExp) {
      const match = title.match(kw);
      if (match) return match[0];
    } else if (title.includes(kw)) {
      return kw;
    }
  }

  // 폴백: 가장 의미있어 보이는 명사구 (3-8자, 조사 제거)
  const words = title.replace(/[,.!?]/g, "").split(/\s+/);
  // 우측에서 의미있는 단어 찾기 (한국어는 핵심이 뒤에 오는 경향)
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    if (w.length >= 3 && w.length <= 8 && !/^(이|그|저|는|은|을|를|에|의)/.test(w)) {
      return w;
    }
  }

  return "";
}

/**
 * 의미 단위 줄 나누기 (가이드 1-1 §3 줄 나누기 원칙)
 * - 한 줄 한글 8-10자 이내
 * - 어절 단위로 끊음 (공백 기준)
 * - 강조어가 줄 끝에서 쪼개지지 않게
 * - 각 줄 길이 비슷하게
 */
function autoLineBreak(text, emphasis = "", maxLine = 10) {
  if (!text || text.trim().length === 0) return text;

  // 이미 \n이 있으면 그대로 사용
  if (text.includes("\n")) return text;

  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return text;

  // 그리디 알고리즘: 한 줄 누적 길이가 maxLine 초과 직전에 줄바꿈
  // 공백 가중치는 countDisplayLen과 일치시켜야 함 (= 0.3em)
  const SPACE_LEN = 0.3;
  const lines = [];
  let current = [];
  let currentLen = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordLen = countDisplayLen(word);
    const addLen = currentLen === 0 ? wordLen : currentLen + SPACE_LEN + wordLen;

    if (addLen <= maxLine || currentLen === 0) {
      current.push(word);
      currentLen = addLen;
    } else {
      lines.push(current.join(" "));
      current = [word];
      currentLen = wordLen;
    }
  }

  if (current.length > 0) {
    lines.push(current.join(" "));
  }

  // 강조어가 줄에 쪼개지지 않게 보정
  // (강조어가 여러 어절이면 한 줄에 묶기)
  const result = lines.join("\n");
  if (emphasis && emphasis.includes(" ")) {
    // 강조어가 줄바꿈으로 쪼개졌는지 확인
    const emphasisFlat = emphasis.replace(/\s+/g, " ");
    const resultFlat = result.replace(/\n/g, " ");
    if (resultFlat.includes(emphasisFlat) && !result.includes(emphasisFlat)) {
      // 쪼개진 경우 — 강조어를 한 줄로 합치기
      return mergeEmphasisLine(result, emphasis);
    }
  }

  return result;
}

/**
 * 글자 표시 길이 계산 — Pretendard Bold 36px 시각적 폭 (한글 1em 기준)
 * 폭 300px = 한글 약 8.3em
 * 영문 대문자(A,B...) ≈ 0.65em / 소문자(a,b...) ≈ 0.55em / 좁은 글자(i,l) ≈ 0.3em
 * 숫자 ≈ 0.6em / 공백 ≈ 0.3em / 특수문자 ≈ 0.4em
 */
function countDisplayLen(text) {
  let len = 0;
  for (const ch of text) {
    if (/[가-힣]/.test(ch)) len += 1.0;                  // 한글
    else if (/[A-Z]/.test(ch)) len += 0.65;              // 영문 대문자
    else if (/[ilj]/.test(ch)) len += 0.3;               // 좁은 영문
    else if (/[a-z]/.test(ch)) len += 0.55;              // 영문 소문자
    else if (/[0-9]/.test(ch)) len += 0.6;               // 숫자
    else if (/\s/.test(ch)) len += 0.3;                  // 공백
    else if (/[.,!?]/.test(ch)) len += 0.3;              // 문장부호
    else len += 0.5;                                       // 기타
  }
  return len;
}

/**
 * 강조어가 줄바꿈으로 쪼개졌을 때 한 줄로 합치기
 */
function mergeEmphasisLine(lineBreakText, emphasis) {
  const flat = lineBreakText.replace(/\n/g, " ");
  const idx = flat.indexOf(emphasis);
  if (idx === -1) return lineBreakText;

  // 강조어 위치 기준으로 다시 줄바꿈
  const before = flat.substring(0, idx).trim();
  const after = flat.substring(idx + emphasis.length).trim();

  const result = [];
  if (before) result.push(before);
  result.push(emphasis);
  if (after) result.push(after);

  return result.join("\n");
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
