---
title: CdBd 블로그 이미지 분석 + 자동 생성 가이드
created: 2026-06-22
updated: 2026-06-22
source: https://home.cdbd.in/blog (page 1~15 전체)
scope: 게시물 약 90개 / 이미지 390장 직접 다운로드·분석
purpose: 블로그 글 → 이미지 자동 생성 자동화를 위한 패턴 학습 자료
tags: [cdbd, blog, image, automation, design-guide]
---

# CdBd 블로그 이미지 분석 + 자동 생성 가이드

> 블로그 **15페이지 전체 / 게시물 약 90개 / 이미지 390장**을 직접 다운로드해 한 장씩 눈으로 분석한 결과.
> 원본 이미지: `블로그/이미지/_downloads/` (게시물별 폴더: `p1~p6_*`=초기 6개, `pg2_1`~`pg8_6`=나머지 42개)
> 목적: "블로그 글을 던지면 자동으로 이미지를 만든다"를 위한 **이미지 타입 분류 + 디자인 토큰 + 글→이미지 매핑 규칙 + 자동화 설계서**.
> 상세 게시물별 분류: [[블로그/이미지/_분석원본_게시물별 이미지 분류.md]]

---

## 0. 한 줄 결론 (약 90개 분석 후 최종 갱신)

CdBd 블로그 이미지는 **16종의 정해진 아키타입의 반복**이다.
- 초기 6종(A~F) = 제품/UI 마케팅 그래픽
- 사례·소트리더십·시리즈용 6종(G~L) = 커버·실사진·인포그래픽·문제신·갤러리·관련글
- **프로필링크/링크트리대안/라운드업 구간에서 4종(M~P) 추가** = 외부 스크린샷·가격표·스티커콜라주·인스타앱화면

**글의 "장르"가 이미지 세트를 결정한다** — 사례글=실사진, 가이드=UI 스크린샷, 비교글=Before/After, 비용글=수치, 소트리더십=실사진+인포그래픽, **링크/툴 라운드업글=외부 스크린샷(M) 다수**.
→ 자동화 = **(1) 글 장르 판별 → (2) 장르별 이미지 세트 템플릿 선택 → (3) 섹션별 타입 배정 → (4) 고정 디자인 토큰으로 렌더**.

> ⚠️ **중대 발견**: 전체의 상당수(M·N·P·H)는 **생성 불가, 캡처/촬영해야 하는 이미지**다. (경쟁사·외부툴 화면, 인스타 화면, 실사진) → 자동화는 "생성"보다 "**실 캡처 + 데코 합성 + 에셋 재사용**"이 중심이어야 한다. 실제로 동일 에디터 스크린샷·publish GIF·더미 브랜드가 글마다 대량 재사용됨이 확인됨.

---

## 1. 공통 디자인 시스템 (전 이미지 공유) — 갱신·확정

| 요소 | 값 |
|------|-----|
| **주 강조색 (보라)** | `#7C5CFF` 계열 (관측 범위 `#6C5CE7`~`#8B7CF7`). 버튼·배지·브레드크럼·`>`화살표·손가락 커서·점선박스 |
| **보조색 (민트/그린)** | `#34D399` ~ `#4DE6A0`. CdBd 브랜드 그린 · 긍정/완료 · play형 커서 |
| **UI 액션 블루** | `#2D7FF9`. 에디터 토글·슬라이더·링크·선택 링·일부 dashed 강조 |
| **경고/문제 레드** | `#EF4444`. 종이/구방식 X 표시·취소콜 |
| **NEW 배지 옐로우** | `#FBBF24` |
| **배경 ①** | 라이트 그레이 + 미세 격자 `#E8EAED`~`#EEF0F2` (Hero·UI그래픽) |
| **배경 ②** | 라벤더 보라 격자 `#B9A9F2`~`#C9BFF5` (결과 showcase·폼 강조) |
| **배경 ③** | 니어블랙 `#0E0E0E`~`#111` (커버/다크 Hero/시리즈 인트로) |
| **디바이스** | iPhone 15/16 Pro, 티타늄 베젤 + Dynamic Island. 커버는 인디고림 다크 프레임 |
| **폰트** | Pretendard. 다크 Hero는 흰색+보라+민트 3색 헤드라인 |
| **반복 데코** | 4각 sparkle✦, 3D 메모지, 매직완드, 3D 아이콘(엑셀·QR·메가폰·다운로드·돈자루·팔레트·지구+새싹), 손그림 화살표, 점선 콜아웃, 손가락 커서, 키워드 알약칩, 그린체크칩, 푸터 `# CdBd · home.cdbd.in` |
| **커서 2종** | 보라 손가락👆 / 그린 삼각 play▶ — 혼용됨 |
| **점선 2종** | 블루 점선 / 보라 점선 콜아웃·선택박스 |
| **더미 데이터** | 가짜 브랜드(THE SAGE·TRINTAYE·FINDERS·STech·네스코·Scotify…) + 가짜 명단(BTS 멤버 본명 등) + 더미 통계(66.7/33.3·90%·17그루·80/88%) |

---

## 2. 이미지 아키타입 12종 (A~F 제품/UI, G~L 콘텐츠/사례)

### ▍그룹 1 — 제품·UI 마케팅 그래픽 (가이드/기능/비교/비용글)

**TYPE A. Hero 목업** — 도입부 결과물.
- 변형: ① 라이트그레이 격자 + 기울인 아이폰 1~2대(클래식) ② **다크 Hero**(니어블랙 배경, 좌측 헤드라인+우측 폰 1대, 시리즈 인트로용) ③ 멀티디바이스(폰 3~5대, dotted-arc 곡선 점선으로 연결).

**TYPE B. 효익·수치 강조** — ROI/절감/KPI.
- 변형: ① 돈자루+종이더미 ② **시소(저울)** 구도(종이명함 vs "월 500원" 배지, "90% 절감") ③ 다크 stat Hero ④ ESG형(발광 원 안 지구+새싹, "17그루/80%").

**TYPE C. 제품 UI 스크린샷** — how-to·기능설명. **가장 많음(전체의 ~40%)**.
- 둥근카드 에디터/데이터/통계 캡처 + 손가락(보라) 또는 play(그린) 커서 + 점선 강조 + 말풍선/배지. alt가 "아이콘"이라 해도 실제론 풀 UI인 경우 많음 → **실제 캡처 합성 권장**.

**TYPE D. Before/After 비교** — 경쟁/구방식 대비.
- 좌우 2분할 + 점선 구분선 + "VS" 배지. 좌=문제(무채색/흐림), 우=해결(컬러). 하단 키워드칩(좌 단점 / 우 장점 그린체크).

**TYPE E. 단계 흐름** — 입력→결과.
- 폰/카드/타일 2~3개를 보라 `>` 화살표 또는 점선 path로 연결. (QR→폼→통계 / 빈카드→URL→완성 / 마스터→복사본A·B / 스토리→상품→매장).

**TYPE F. 결과 풀스크린 / 브레드크럼** — 완성 페이지·시작경로.
- 변형: ① 폰 프레임 안 실제 페이지 1장(브랜드컬러) ② **템플릿-디테일 split**(좌 에디터 사이드바 + 우 폰 프리뷰, CdBd 템플릿 페이지 캡처) ③ **플로팅 카드 showcase**(보라배경에 제품상세/영상/문의 카드 3개 겹침) ④ 보라 알약 브레드크럼.

### ▍그룹 2 — 콘텐츠·사례·소트리더십 (사례글/인사이트글/시리즈)

**TYPE G. 커버 / 썸네일 (og:image)** — 블로그 목록 카드 + 글 머리.
- 니어블랙 배경, 흰색 헤드라인+1개 강조색 구문, 3D 오브젝트/sparkle, 작은 목업/메뉴 인셋, 푸터 `# CdBd`. **본문 이미지와 구분해 태깅 필요.**

**TYPE H. 브랜드 실사진 / 현장 포토** — 케이스 스터디·소트리더십.
- 실제 매장 외관·내부·팝업·전시부스·제품 디테일·UGC 먹방 스틸·오피스 인물(뒷모습 편집 장면). CdBd UI/목업 아님. (귤메달·뷰미디어·Netflix House·레드불·성심당·오피스 라이프스타일).

**TYPE I. 개념 인포그래픽 / 다이어그램** — 로직·구조 설명.
- 분기형 링크 다이어그램(`URL → A/B/C/D 고객` 개인화), 2×2 사분면 그리드(N조건/N활용), 팬아웃(엑셀→전직원), 손그림 wavy 커넥터 + 격자 배경 + 보라 노드박스.

**TYPE J. 문제 드라마타이즈 신** — 페인포인트 강조.
- ① floating-3D-icon-cluster(무채색 3D 레거시 오브젝트 + 생각구름 + 고민 메모지) ② messy-overload-scene(구글폼+스프레드시트+카톡 콜라주 + 날리는 종이 + 스트레스 메모지).

**TYPE K. 갤러리 스트립 / 멀티디바이스 showcase** — 다양성·라인업.
- 완성 폰 화면 4~5개를 나란히(개인화/비공개/예약형/RSVP… 또는 산업별 Jewelry/Food/Car/Fashion).

**TYPE L. 관련글 추천 카드** — ⚠️ **본문 콘텐츠 아님. 자동화 제외 대상.**
- 다크 사진 위 제목 오버레이(넷플릭스/레드불/성심당/GEO 등). 여러 글에서 ID 재사용. 스크랩 시 반드시 필터링.

### ▍그룹 3 — 외부 캡처·표·콜라주 (프로필링크·링크트리대안·라운드업·인사이트글) 〔신규〕

**TYPE M. 외부 툴/앱/웹사이트 스크린샷** — ⚠️ **생성 불가, 캡처 필요.**
- 경쟁사(링크트리·리틀리·인포크링크), SaaS 툴(Jasper·Surfer·Midjourney·Lexica·Manychat·Vrew), 레퍼런스 사이트(Pexels·Pixabay 등), 구글 AI Overview(소셜프루프, CdBd 빨간박스 강조), 실제 브랜드 사이트. 라운드업/비교/인사이트글의 주력(한 항목당 1장).

**TYPE N. 가격 비교 표** — 경쟁 요금제 카드($4/$7.5/$19.5 + 원화 알약) + 기능 리스트. (링크트리 무료vs유료 등)

**TYPE O. 스티커 콜라주** — 흰 배경에 폰트/이미지모양 샘플칩·3D 구미(gummy) 로고·메모지 신체부위·말풍선을 기울여 흩뿌린 구도. 정적/gif 모두. (폰트 소개, 올리브영 패러디 프로모 등)

**TYPE P. 인스타 앱 화면 스트립** — 실제 IG 프로필/피드/릴스 화면 폰 2~3개. ⚠️ 캡처 필요. (프로필링크 한계 설명·실브랜드 케이스)

> **변형/추가 관찰**: ① I(인포그래픽)에 **라벤더격자 3D 컨셉아이콘 세트**(팔레트·매직완드+시계·차트+영수증 = "N가지 조건") 변형 추가 ② H(실사진)에 **흑백 권위자 인물사진**(Jakob Nielsen 등) 변형 ③ C/G **하이브리드 인사이트 커버**(다크 배경 + 아이소메트릭/3D메모지 일러스트 + 좌하단 헤드라인, CTA·AI글쓰기 글).

---

## 3. 글 장르 → 이미지 세트 매핑 (자동화 핵심 규칙)

| 글 장르 (제목/내용 신호) | 표준 이미지 세트 | 비고 |
|---|---|---|
| **사례 / 후기** ("~사례", 브랜드명, 인터뷰) | A(Hero) + F(결과 풀스크린 1~3) + **H(현장 실사진 다수)** | 실사진이 주력. 자동생성보다 실제 사진 필요 |
| **가이드 / how-to** ("만들기","5분","방법","가이드") | A 또는 다크Hero + **C(UI 3~6장)** + 가끔 E | UI 스크린샷이 핵심 → 실 캡처 합성 |
| **비교 / 대안** ("vs","대안","한계","왜 안 되나") | **D(Before/After)** + J(문제신) + C | D가 글의 뼈대 |
| **비용 / ROI** ("ROI","절감","비용","원") | **B(수치/시소)** + A + C | 큰 숫자 배지 필수, 본문 수치와 일치 |
| **소트리더십 / 인사이트** (레드불·넷플릭스·성심당·GEO) | **H(브랜드 실사진)** + I(인포그래픽) | CdBd 목업 거의 안 씀 |
| **기능 출시 / 업데이트** ("출시","업데이트","NEW","소개") | E(단계흐름) + C + F(플로팅카드) | NEW 옐로배지 |
| **시리즈물** ("시리즈 #N") | **다크 커버 Hero**(보라 "시리즈 #N" 라벨 + 2줄 제목) + 위 장르별 | 시리즈 라벨 토큰 고정 |
| **프로필링크 / 링크인바이오** ("프로필 링크","링크트리","미니홈페이지") | 다크 Hero(A) + **C(에디터 UI 다수)** + D(구글폼/카톡 vs CdBd) + F(완성 프로필) + 경쟁사 **M** | 그룹3 등장 시작 구간 |
| **라운드업 / 리스티클** ("추천 N가지","Best 18","비교","툴") | **M(외부 스크린샷, 항목당 1장)** + 가끔 N(가격표)·O(콜라주) | 거의 캡처. 생성 X |
| **인사이트 / 소트리더십** (CTA카피·AI글쓰기·알고리즘·성심당·레드불) | C/G 하이브리드 커버 + **I(아이소메트릭/개념도)** + H(실사진) + P(인스타) | CdBd 목업 적음 |
| (모든 글 공통) | **G. 커버 썸네일 1장**(og:image) | 목록/SNS 카드용, 항상 생성 |

**배치 관행**: 글 1편 ≈ 이미지 2~9장. 커버 G(1) → 도입 Hero A(1) → 본문 섹션별 C/D/E/F/H/I → (비용글) B(1).

---

## 4. 타입별 생성 프롬프트 템플릿 (이미지 모델용)

> **공통 접두사**: `Clean Korean marketing graphic, Pretendard-style typography, CdBd purple #7C5CFF + mint #34D399 accents, soft drop shadows, glossy 3D-emoji style, no real third-party logos.`

- **A 클래식**: `light gray grid bg, 1-2 iPhone 16 Pro (titanium) tilted, screen = finished mobile {명함/초대장/카탈로그} page for "{브랜드}".`
- **A 다크**: `near-black #111 bg, left = 2-line headline (white + one purple + one mint word) + gray keyword pill chips, right = one tilted iPhone showing a CdBd page. small purple "시리즈 #{N}" label on top.`
- **B 시소**: `seesaw balance: left paper-card stack + money bag (heavy), right purple badge "월 {n}원" (light), arc text "{비용} {%}% 절감".`
- **C**: `rounded-card screenshot of CdBd {editor/data/stats} screen, purple finger cursor on "{버튼}", dashed highlight box, callout badge "{포인트}", light grid bg.`
- **D**: `two-column split, dashed center divider, "VS" badge. Left (muted) "{구방식}" + problem chips. Right (color) "CdBd {기능}" + green-check benefit chips.`
- **E**: `2-3 phone/card frames joined by purple ">" arrows (or dotted path): {단계1} > {단계2} > {단계3}.`
- **F 플로팅카드**: `lavender purple grid bg, 3 overlapping content cards labeled 제품상세/영상/문의, magic-wand + sparkles.`
- **G 커버**: `near-black bg, big 2-line Korean headline (one accent-color phrase), 1 3D object + sparkle, footer "# CdBd · home.cdbd.in".`
- **H**: ⚠️ 생성보다 **실제 현장 사진** 권장 (사례글은 실사 필수).
- **I**: `grid bg, hand-drawn wavy connectors, purple node boxes; branching {URL} → A/B/C/D 고객 personalized links` 또는 `2x2 quadrant, center pill "{N}조건", one 3D icon per cell` 또는 `lavender grid, single glossy 3D concept icon (palette / magic-wand+clock / chart+receipt)`.
- **J**: `chaos scene — Google-Form + spreadsheet + KakaoTalk collage + flying papers + stressed 3D memoji` 또는 `gray bg, scattered monochrome 3D legacy icons + thought clouds around a thinking memoji`.
- **K**: `4-5 finished invitation/card phone screens side by side, each a different style.`
- **M**: ⚠️ 생성 X — 경쟁사/외부툴 **실제 화면 캡처**. (필요 시 소셜프루프용 구글 AI Overview 캡처 + CdBd 빨간박스)
- **N**: `competitor pricing cards (plan name + $price + KRW pill + feature checklist), clean table layout` — 또는 실제 요금표 캡처.
- **O**: `scattered tilted sticker chips on white (font/shape samples or promo words), glossy 3D gummy logo, memoji body parts, squiggle accent.`
- **P**: ⚠️ 생성 X — **실제 Instagram 앱 화면** 캡처(프로필/피드/릴스) 폰 스트립.

---

## 5. ⭐ 자동화 시스템에 필요한 것들 (최종 분석)

사용자 목표 = "블로그 글 던지면 자동으로 이미지 생성". 48개 분석으로 도출한 **필요 구성요소**:

### 5.1 파이프라인
1. **입력 파서**: 글(MD/HTML) → 제목 + 섹션 분할 + 핵심 수치/브랜드/버튼명 슬롯 추출.
2. **장르 분류기**(LLM): 제목·키워드로 §3의 8개 장르 중 하나 판별 → 이미지 세트 템플릿 결정.
3. **섹션→타입 배정기**: 각 섹션을 A~K 중 하나로 라벨(§3 신호표). L(관련글)은 제외.
4. **슬롯 채우기**: 타입별 프롬프트(§4)에 브랜드명·수치·버튼명·비교대상 주입.
5. **렌더러(2-트랙)**:
   - **합성 트랙(권장)**: TYPE C/E/F = 실제 CdBd 에디터/페이지 스크린샷 위에 커서·점선·배지·프레임을 합성. (생성 모델은 UI를 정확히 못 그림)
   - **생성 트랙**: TYPE A/B/D/G/I/J/K = 이미지 생성 모델 + §4 프롬프트 + §1 토큰.
   - TYPE H = 실사진 라이브러리(사례 촬영) 연결.
6. **QA**: 수치=본문 일치, 더미 데이터(실명·실로고 회피), 텍스트 오타, 브랜드컬러 일치 검수.

### 5.2 반드시 구축해야 할 에셋 라이브러리
- **CdBd UI 스크린샷 뱅크**: 에디터/데이터관리/통계/템플릿갤러리/게시모달/색상패널 등 — TYPE C·E·F의 정확도는 여기서 결정됨. (생성 X)
- **디바이스 목업 프레임**(iPhone 티타늄, 단일/2대 기울임/멀티 dotted-arc).
- **3D 데코 에셋팩**(메모지·매직완드·sparkle·엑셀·QR·돈자루·지구+새싹·팔레트).
- **컬러/폰트 디자인 토큰 파일**(§1을 JSON으로, §5.3).
- **더미 데이터 사전**(가짜 브랜드/인물/통계 — 일관성·법적 안전).
- **현장 실사진 아카이브**(케이스 스터디용).

### 5.3 머신리더블 토큰 (시스템 설정값)
```json
{
  "colors": {
    "purple": "#7C5CFF", "purpleRange": ["#6C5CE7","#8B7CF7"],
    "mint": "#34D399", "mintAlt": "#4DE6A0",
    "uiBlue": "#2D7FF9", "warnRed": "#EF4444", "newYellow": "#FBBF24"
  },
  "backgrounds": {
    "grayGrid": "#EEF0F2", "lavenderGrid": "#C0AEF5", "nearBlack": "#111111"
  },
  "device": "iPhone 15/16 Pro, titanium bezel, Dynamic Island",
  "font": "Pretendard",
  "cursors": ["purple-finger", "green-play-triangle"],
  "dashed": ["purple", "blue"],
  "footer": "# CdBd · home.cdbd.in",
  "types": ["A_hero","B_stat","C_ui","D_compare","E_flow","F_result",
            "G_cover","H_photo","I_infographic","J_painscene","K_gallery","L_relatedcard_EXCLUDE",
            "M_external_capture","N_pricing_table","O_sticker_collage","P_instagram_strip"],
  "capture_only_types": ["M","N","P","H"],
  "generatable_types": ["A","B","D","G","I","J","O","K"],
  "composite_types": ["C","E","F"],
  "genres": {
    "case_study":   ["A","F","H","G"],
    "guide_howto":  ["A_dark","C","E","G"],
    "comparison":   ["D","J","C","G"],
    "cost_roi":     ["B","A","C","G"],
    "thought_lead": ["H","I","G","P"],
    "feature_launch":["E","C","F","G"],
    "series_any":   ["A_dark_cover"],
    "profile_link": ["A_dark","C","D","F","M","G"],
    "roundup_listicle": ["M","N","O","G"],
    "insight":      ["G","I","H","P"]
  }
}
```

### 5.4 권장 결론 (90개 분석 후 확정)
타입을 **3트랙**으로 나눠야 한다 (§5.3 JSON에 분류됨):
- **생성 트랙** `A·B·D·G·I·J·O·K` — 이미지 생성 모델 + §4 프롬프트 + §1 토큰. (일러스트·구도형)
- **합성 트랙** `C·E·F` — 실제 CdBd 에디터/페이지 스크린샷 위에 커서·점선·배지·프레임 합성. 전체의 ~40%. **여기 정확도가 시스템 품질을 좌우.**
- **캡처 트랙** `M·N·P·H` — 생성 불가. 경쟁사/외부툴/인스타/실사진은 **수집·촬영**해야 함. (라운드업·인사이트·사례글에서 큰 비중)

핵심:
- **장르 분류가 80%**: 글 장르만 맞히면 이미지 세트가 거의 결정된다(§3). 분류기 정확도에 최우선 투자.
- **에셋 재사용이 실제 운영 방식**: 동일 에디터 스크린샷·publish GIF·더미 브랜드(ORRIS·소록·Jina Park·THE SAGE…)가 글마다 반복 사용됨. → **공용 에셋 라이브러리 + 더미 브랜드 사전**이 생성보다 효율적·일관적.
- **토큰 고정 = 브랜드 일관성**: §5.3을 단일 소스로 두고 모든 렌더가 참조.
- **캡처 트랙 비중 과소평가 금지**: "글 던지면 다 자동생성"은 불가능. 캡처가 필요한 타입은 사람/스크래퍼 개입 단계를 파이프라인에 명시해야 함.

### 5.5 더미 브랜드/데이터 라이브러리 (관측 누적 — 일관성·법적 안전용)
- **명함/B2B**: 에스원(실고객)·STech Energy·FINDERS·네스코·한화 ANTO·A1 Security · 인물 김현수/박지훈/이지원/Myungwoo Lee
- **초대장/행사**: THE SAGE「The Heritage Summit」· TRINTAS/TRINTAYE「The Signature Day」/SOVEREIGN · GALLERY VARESE SEOUL/큐레이터 MICHAEL LANG · Scotify「2024 Wrapped」· MK 법무법인 · 인물 황영기 회장/김성은 (+ BTS 멤버 본명 명단)
- **카탈로그/커머스**: BLUE NOTE · ELVE Lab · SUNCOVE CLUB · VIEW MEDIA(뷰미디어) · 귤메달/prika · 30M Diamond Club
- **프로필링크**: ORRIS(향수) · 소록(한식) · Lumα Pilates · Designer Jina Park · Kasing Lung/Wacky Mart「The Monsters」· 쇼호스트 박지나 · IC클리닉 강남 · OLICE YOUNG(올리브영 패러디)
- **더미 통계**: 66.7/33.3% · 90% 절감 · 17그루 · 80/88% · 페이지뷰 12,708/클릭 9,062/71.3% · URL slug `cdbd.in/brand/26spring`

---

## 6. 커버리지 / 한계

- **분석 완료**: 15페이지 전체, 게시물 약 90개, **이미지 390장**.
- **누락(부분)**: ① `레드불`(pg6_2) 이미지 전체 — lazy-load 실패. ② `전사명함 일괄발급`(pg3_3) 단계 4장 ③ `프로모션 올리브영`(pg13_2) 단계 갤러리 ④ 일부 본문 이미지가 og:image/썸네일만 노출.
- **원인**: Wix가 본문 이미지를 JS 지연로딩 → 정적 HTML 미노출. **헤드리스 브라우저(렌더링 기반) 재수집**이면 100% 회수 가능.
- **GIF 주의**: 기능 데모 gif는 첫 프레임이 전환 중(빈 화면)일 수 있음 → 명시적으로 frame 0 또는 후반 프레임 추출 필요.

---

## 부록. 원본 폴더 인덱스
```
블로그/이미지/_downloads/
├── p1~p6_*/         초기 6개 글 (22장)
├── pg2_1 … pg8_6/   페이지 2~8, 42개 글 (154장)
└── pg9_1 … pg15_6/  페이지 9~15, 42개 글 (214장)
```
> 페이지 9~15 상세 분류는 [[블로그/이미지/_분석원본_게시물별 이미지 분류.md]] 하단 참조.
