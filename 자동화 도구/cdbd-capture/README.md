# CdBd Capture — 에디터·관리자 화면 자동 캡처 + 블로그 이미지 viewer 캡처

> Playwright 기반 CdBd 자동 캡처 인프라.
> - **에디터·관리자 캡처** (로그인 필요): 썸네일 [[1-3-2. 이미지 리소스 북]] § 3.2
> - **블로그 이미지 viewer 섹션 캡처** (로그인 불필요): 블로그/이미지/1-3. 이미지 규칙 §4.1

## ⚡ 블로그 이미지 — viewer 3 섹션 캡처 (NEW 2026-06-19)

> A 유형 블로그 이미지 (3개 폰)의 SCREEN_1/2/3에 들어갈 viewer 3 섹션을 한 번에 캡처.

### 사용법

```bash
cd "자동화 도구/cdbd-capture"
npm install                                    # 첫 번째 1회만
npx playwright install chromium                # 첫 번째 1회만 (~150MB)

# seminar viewer 3 섹션 자동 캡처
node capture-seminar-3sections.mjs

# 다른 viewer 사용
node capture-seminar-3sections.mjs https://www.cdbd.in/templates/invitation/personalized/viewer trintas
```

### 동작

1. viewer 진입 → **천천히 풀스크롤** (lazy-load 모두 트리거)
2. 키워드 기반으로 의미 섹션 자동 탐지:
   - **`1-hero`**: "회장님께", "Welcome", "초대합니다" 등 → 인사말 섹션
   - **`2-rsvp`**: "참석", "RSVP", "정보 등록" 등 → RSVP 폼 섹션
   - **`3-contact`**: "문의", "연락", "contact" 등 → 연락처 섹션
3. 각 섹션을 **A 유형 SCREEN aspect (0.4654)** 에 맞춘 viewport (390×838)로 캡처
4. `screenshots/blog-image-A/` 에 3장 + 풀페이지 + 메타 저장

### 출력

```
screenshots/blog-image-A/
├── seminar-1-hero.png        ← 블로그 이미지 SCREEN_1에 fill
├── seminar-2-rsvp.png        ← SCREEN_2에 fill
├── seminar-3-contact.png     ← SCREEN_3에 fill
├── seminar-fullpage.png      ← 전체 페이지 (참고용)
└── seminar-sections.json     ← 탐지된 섹션 y 좌표 메타
```

### Claude에게 전달

```
"자동화 도구/cdbd-capture/screenshots/blog-image-A/seminar-1-hero.png, 
seminar-2-rsvp.png, seminar-3-contact.png 3장을 
블로그 이미지 A 유형(15:25)에 적용해줘"
```

---

## 📚 C 멀티목업 — 카탈로그 페이지별 캡처 (NEW 2026-06-22)

> **C 유형(멀티 목업)** 은 카탈로그의 **서로 다른 페이지**를 여러 목업에 나란히 보여주는 레이아웃.
> ⚠️ 표지 1장을 상·하로 쪼개는 것 ❌ / **페이지를 넘겨가며 각 페이지 캡처** ⭕

### 왜 Playwright가 필요한가
- 카탈로그 viewer는 **화살표 없는 가로 스와이프 캐러셀**("1/4") 구조
- **Microlink는 1페이지만** 캡처 (캐러셀을 못 넘김)
- 일부 카탈로그(oak_table·lookbook)는 Microlink 봇 환경에서 **백지 렌더링** (lazy-load 실패)
- → Playwright 마우스 드래그로 페이지를 넘기고, 콘텐츠 영역만 클립

### 사용법

```bash
cd "자동화 도구/cdbd-capture"
node capture-catalog-pages.mjs <viewer-url> <outPrefix> [pageCount]

# 예: newarrival 카탈로그 4페이지 캡처
node capture-catalog-pages.mjs https://www.cdbd.in/templates/catalog/newarrival/viewer nvc 4
```

### 동작
1. viewer 진입 (로그인 불필요) → 렌더 대기
2. 하단 페이저 바("N/M") 숨김
3. 페이지별로:
   - **채도 있는 콘텐츠 영역만 클립** (회색 여백·페이저 제거)
   - 마우스 드래그(우→좌)로 다음 페이지 넘김 → 페이저 텍스트 변화로 확인
   - 실패 시 키보드 ArrowRight fallback
4. `screenshots/catalog-pages/{prefix}-page{N}.png` 저장

### 출력 (newarrival 예시)
```
screenshots/catalog-pages/
├── nvc-page1.png   ← 표지 (BEYOND LIQUID)
├── nvc-page2.png   ← 제품 상세 (ROSE QUARTZ GLOW + 가격 + 구매)
├── nvc-page3.png   ← 주문 (프리오더 6+3 증정)
└── nvc-page4.png   ← 추가 페이지
```

### Figma 적용 (MCP)
1. `upload_assets`로 각 페이지 업로드 → imageHash 획득
2. C 슬롯(`1:1287`) clone → VISUAL_SLOT_1/2/3에 멀티페이지 목업(`1:1370`) 인스턴스
3. 각 목업 내부 흰색 rect를 페이지 imageHash로 fill (scaleMode FILL)
4. 좌→우 순서 = 카탈로그 흐름 (표지→제품→주문), 중앙 목업이 돌출

---

## 🛠 에디터·관리자 화면 캡처 (기존)

---

## 🚀 빠른 시작 (사용자가 해야 할 일)

### 1단계 — CdBd 데모 계정 만들기
1. https://www.cdbd.in/login 접속
2. "지금 가입하기" 클릭 → **별도 데모 계정** 가입 (⚠️ 평소 메인 계정 X)
3. 데모 워크스페이스에 깨끗한 샘플 콘텐츠 1~2개 생성 (캡처 시 보일 데이터)

### 2단계 — `.env` 파일 작성
```bash
cd "자동화 도구/cdbd-capture"
cp .env.example .env
# .env 파일을 에디터로 열고 CDBD_EMAIL, CDBD_PASSWORD 채우기
```

**⚠️ 보안:**
- `.env` 파일은 `.gitignore`로 git 커밋 차단됨 (이미 설정 완료)
- 비밀번호는 데모 계정 전용 — 다른 서비스와 공유하지 않은 새 비번 사용
- 절대 본인 메인 계정 자격증명 사용 X

### 3단계 — Playwright 설치 (이미 진행 중일 수 있음)
```bash
cd "자동화 도구/cdbd-capture"
npm install
npx playwright install chromium
```

### 4단계 — 로그인 PoC 실행
```bash
npm run login-poc
```

성공하면 `에디터 캡처본/01-login-page.png ~ 04-editor.png` 4장 생성됨.
실패하면 `error.png` 에 에러 시점 화면 저장.

---

## 📂 디렉토리 구조

```
자동화 도구/cdbd-capture/
├── package.json
├── .env.example          ← 템플릿 (git 추적)
├── .env                  ← 실제 자격증명 (git 무시)
├── README.md             ← 이 파일
├── login-poc.mjs         ← 로그인 + 에디터 진입 PoC
├── capture-all.mjs       ← (TBD) § 3.2의 8개 화면 일괄 캡처
├── lib/                  ← 공통 모듈 (login helper 등)
└── 에디터 캡처본/          ← 캡처 결과 (git 무시)
```

---

## 🔧 디버깅 팁

### 로그인 실패 시
- `.env` 의 `HEADLESS=false` 로 변경 → 브라우저 창이 열려서 시각 확인 가능
- `SLOW_MO=500` 추가 → 각 동작 0.5초 간격으로 천천히 (단계 확인)
- `에디터 캡처본/error.png` 확인 — 실패 시점 화면

### CdBd 측이 봇 차단을 한다면
- User-Agent 변경 시도
- 캡차 등장 시 → headless=false 로 수동 통과 후 storage state 저장 → 다음부터 재사용

```js
// 캡차 우회 패턴 (lib/auth.mjs 에 구현 예정)
await context.storageState({ path: 'auth-state.json' });
// 다음 실행 시:
const context = await browser.newContext({ storageState: 'auth-state.json' });
```

---

## 🎯 다음 단계 (PoC 성공 후)

1. **`capture-all.mjs` 작성** — § 3.2의 8개 우선 후보 자동 캡처
2. **DOM 텍스트 추출** — 각 화면의 정확한 기능명·카드명을 텍스트로 추출 (캡처 + 텍스트 메타)
3. **소재집 § 3.2 자동 보충** — JSON으로 출력 후 매니페스트에 머지

---

## ⚠️ 운영 주의사항

- **rate limit** — CdBd 측 부담 안 주도록 캡처 간 2~3초 대기 권장
- **봇 차단** — 자동화 차단되면 헤드리스 모드 끄고 수동 보조
- **데모 계정 비번 변경 시** → `.env` 업데이트
- **CdBd UI 변경 시** → selector 깨질 수 있음, `placeholder` 또는 `getByLabel` 등 견고한 selector 사용
