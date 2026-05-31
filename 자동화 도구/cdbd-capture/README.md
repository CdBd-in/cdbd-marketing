# CdBd Capture — 에디터·관리자 화면 자동 캡처

> CdBd 에디터·관리자 페이지(로그인 필요)를 Playwright로 자동 캡처하는 도구.
> [[1-3-2. 이미지 리소스 북]] § 3.2 (에디터 유래 기능) 자동 보충을 위한 인프라.

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

성공하면 `screenshots/01-login-page.png ~ 04-editor.png` 4장 생성됨.
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
└── screenshots/          ← 캡처 결과 (git 무시)
```

---

## 🔧 디버깅 팁

### 로그인 실패 시
- `.env` 의 `HEADLESS=false` 로 변경 → 브라우저 창이 열려서 시각 확인 가능
- `SLOW_MO=500` 추가 → 각 동작 0.5초 간격으로 천천히 (단계 확인)
- `screenshots/error.png` 확인 — 실패 시점 화면

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
