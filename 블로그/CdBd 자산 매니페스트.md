---
tags:
  - design-system
  - manifest
  - blog
  - automation
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[블로그/썸네일 디자인 시스템]]"
---

# CdBd 자산 매니페스트

> **목적**: 블로그 썸네일 자동 생성 시 Claude가 타이틀에 맞는 적절한 시각 자산을 *자동 선택*할 수 있도록 한 카탈로그.
> **사용처**: [[블로그/썸네일 디자인 시스템]] 섹션 8 프롬프트 템플릿과 함께 컨텍스트로 전달.
> **운영 원칙**: 80% 자동 / 20% 사용자 선택권 — 후보 1~3개를 Claude가 추천하고, 명백한 케이스는 바로 진행.

---

## 1. Claude 사용 가이드 — 타이틀 → 자산 선택 알고리즘

타이틀을 받으면 다음 순서로 자산 선택:

### Step 1. 콘텐츠 종류 분류
| 타이틀 패턴 | 분류 | 참조 섹션 |
|------------|------|----------|
| "X 만들고 / X로 / X 활용법 / X 사용 사례" | **템플릿 강조** | § 2 템플릿 카탈로그 |
| "X 기능 / X 업데이트 / X 추가 / 새로운 X" | **기능 강조** | § 3 기능 캡처 라이브러리 |
| "AI / 자동화 / 디자인 시스템 / 인사이트" | **메타·서비스 강조** | § 4 데코·3D 오브젝트 위주 |

### Step 2. 키워드 → 자산 후보 추출
타이틀 키워드를 § 5 컨셉 매핑 사전과 대조하여 자산 후보 1~3개 추출.

### Step 3. 다중 매칭 시 선택 기준
- 시각적 임팩트가 큰 자산 우선 (#프리미엄 > #일반)
- 최근 사용 이력이 적은 자산 우선 (다양성 확보)
- 타이틀의 산업·고객층과 일치하는 태그 우선

### Step 4. Fallback
매칭 없으면 → 사용자에게 확인 ("X 또는 Y 중 어떤 화면이 적합?")

---

## 2. 템플릿 카탈로그 (Microlink 캡처 가능)

> **호출 패턴**: `{templates URL}/viewer` + `waitUntil=networkidle0&waitForTimeout=5000` + 모바일 뷰포트 375×812
> **출처**: https://www.cdbd.in/templates/all

### 2.1. 프로필·명함 (`profilelink`)

| 슬러그 | 한글명 | 태그 | viewer URL | 사용 이력 |
|--------|--------|------|------------|-----------|
| `promotion` | A1 시큐리티 명함 | #명함 #프로필 #B2B #보안 #직원소개 #진중함 | https://www.cdbd.in/templates/profilelink/promotion/viewer | 2026-05-26 T2 명함·브로셔 |

### 2.2. 홍보·카탈로그 (`catalog`)

| 슬러그 | 한글명 | 태그 | viewer URL | 사용 이력 |
|--------|--------|------|------------|-----------|
| `oak_table` | Premium Oak Dining Table | #브로셔 #카탈로그 #가구 #프리미엄 #제품상세 #따뜻한톤 | https://www.cdbd.in/templates/catalog/oak_table/viewer | 2026-05-26 T2 명함·브로셔 |
| `newarrival` | 신상품 카탈로그 | #카탈로그 #신상 #쇼핑몰 | https://www.cdbd.in/templates/catalog/newarrival/viewer | (디자인 시스템 노트 예시) |

### 2.3. 초대·예약 (`invitation`)

| 슬러그 | 한글명 | 태그 | viewer URL | 사용 이력 |
|--------|--------|------|------------|-----------|
| _TBD_ | (인스타 이벤트 신청 작업 시 사용) | #이벤트 #초대장 #RSVP #SNS | _TBD — Figma 4658:1807 확인 필요_ | 2026-05-26 T4 인스타 이벤트 |
| _TBD_ | (개인화 초대장 작업 시 사용) | #초대장 #개인화 #VIP | _TBD — Figma 4659:1807 확인 필요_ | 2026-05-26 T4 개인화 초대장 |

### 2.4. 소식·매거진 (`magazine`)

_(아직 사용 자산 없음 — 추후 추가)_

### 2.5. 가이드·신청 (`guide`)

| 슬러그 | 한글명 | 태그 | viewer URL | 사용 이력 |
|--------|--------|------|------------|-----------|
| _TBD_ | (사전예약 신청 작업 시 사용) | #신청서 #사전예약 #폼 | _TBD — Figma 4678:1807 확인 필요_ | 2026-05-26 T1 사전예약 신청 |

---

## 3. 기능 캡처 라이브러리 (로그인 필요 → 미리 캡처)

> CdBd 에디터·관리자 페이지 등 로그인이 필요한 화면은 Microlink로 캡처 불가. 한 번 수동 캡처 후 attachments 폴더에 저장.

**저장 위치**: `attachments/cdbd-features/`
**파일명 컨벤션**: `{도메인}_{기능}_{태그}.png`
- 예: `editor_layer-add_ui-update.png`
- 예: `feature_team-share_collaboration.png`

| 기능명 | 태그 | 파일 경로 | 캡처 일자 |
|--------|------|-----------|-----------|
| _TBD_ | _아직 캡처 안 됨 — 다음 세션 첫 작업_ | — | — |

### 우선 캡처 후보 (자주 등장할 만한 기능)
- [ ] 카드 쌓기 / 에디터 메인 화면
- [ ] 레이어 추가
- [ ] 스타일 시스템 (테마, 색상)
- [ ] **팀 공유** (협업 권한 설정 UI)
- [ ] 폼 빌더 (응답 수집)
- [ ] 분석 대시보드
- [ ] 개인화 QR 생성
- [ ] 프로필 링크 편집기
- [ ] AI 자동 디자인
- [ ] 다국어 번역

---

## 4. 데코·3D 오브젝트

### 4.1. Thiings 다운로드

> URL 패턴: `https://www.thiings.co/things/{slug}` → 페이지에서 PNG 직접 다운로드
> 저장 위치: `attachments/decorations/` (자주 쓰는 건 미리 저장)

| 슬러그 | 이름 | 태그 | 다운로드 URL / 로컬 경로 | 사용 이력 |
|--------|------|------|--------------------------|-----------|
| `sparkle` | 별 스파클 (노란 별 3개) | #포인트 #강조 #기본값 #반짝 | https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-SJcxLxIC8lH8u7d9CvcOGIULgEz7wX.png | 2026-05-26 T2 명함·브로셔 |

### 우선 다운로드 후보 (자주 쓸 데코)
- [ ] `magic-wand` — #AI #자동화 #마법
- [ ] `chart-up` — #성장 #분석 #상승
- [ ] `calendar` — #일정 #예약
- [ ] `gift` — #이벤트 #혜택
- [ ] `shield` — #안전 #보안
- [ ] `globe` — #글로벌 #해외
- [ ] `hands` — #협업 #공유
- [ ] `lightbulb` — #아이디어 #팁
- [ ] `rocket` — #런칭 #신규
- [ ] `crown` — #프리미엄 #VIP

### 4.2. 이모지·Memoji

| 종류 | 태그 | 출처/파일 | 사용 이력 |
|------|------|-----------|-----------|
| _TBD_ | _아직 사용 자산 없음_ | _Mac Memoji 직접 추출 또는 직접 디자인_ | — |

### 우선 추출 후보
- [ ] memoji 사람 1명 (정면, 미소) — #프로필 #사용자
- [ ] memoji 사람 2~3명 그룹 — #팀 #협업
- [ ] memoji 손 (엄지 위) — #추천 #좋아요
- [ ] memoji 손 (가리키기) — #주목 #여기

---

## 5. 컨셉 매핑 사전

> **타이틀 키워드 → 추천 자산 매핑.** Claude가 자동 후보 추출 시 활용.

### 5.1. 키워드 → 추천 데코

| 키워드 | 데코 후보 (Thiings) |
|--------|---------------------|
| "AI", "자동화", "스마트" | magic-wand, ai-sparkle |
| "팀", "협업", "공유" | memoji 사람 그룹, hands |
| "성장", "성공", "매출", "분석" | chart-up, trophy |
| "안전", "보안", "신뢰" | shield, lock |
| "글로벌", "해외", "다국어" | globe, plane |
| "이벤트", "초대", "RSVP" | gift, calendar |
| "아이디어", "팁", "노하우" | lightbulb |
| "런칭", "출시", "신규", "오픈" | rocket |
| "프리미엄", "VIP", "고급" | crown |
| **일반 강조 (기본값)** | **sparkle** ⭐ |

### 5.2. 키워드 → 추천 템플릿 카테고리

| 타이틀 키워드 | 카테고리 후보 |
|--------------|---------------|
| "명함", "프로필", "소개", "포트폴리오" | `profilelink` |
| "브로셔", "카탈로그", "제품 소개", "상세 페이지" | `catalog` |
| "초대장", "RSVP", "이벤트 신청", "예약" | `invitation` |
| "잡지", "소식", "월간", "뉴스레터" | `magazine` |
| "가이드", "튜토리얼", "신청서", "사전예약" | `guide` |

### 5.3. 콘텐츠 종류별 비주얼 조합 추천

| 콘텐츠 종류 | 주 비주얼 | 보조 비주얼 |
|------------|-----------|-------------|
| 템플릿 강조 (단일) | 목업 1개 (해당 카테고리 viewer) | sparkle 데코 |
| 템플릿 강조 (다중 - "X와 Y") | 목업 2~3개 겹침 (한 덩어리) | sparkle 데코 + Memoji |
| 기능 강조 | 목업 1개 (기능 화면 캡처) | 관련 키워드 데코 |
| 메타·서비스 강조 | 3D 오브젝트 (Thiings) | (선택) Memoji |

---

## 6. Microlink 캡처 표준 명령어

```bash
# 모바일 뷰포트 (썸네일 목업용 — 권장)
URL_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('{대상 URL}', safe=''))")
curl -s "https://api.microlink.io/?url=${URL_ENCODED}&screenshot=true&meta=false&viewport.width=375&viewport.height=812&waitUntil=networkidle0&waitForTimeout=5000&full-page=true" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['screenshot']['url'])"

# 데스크탑 뷰포트 (필요시)
# viewport.width=1440&viewport.height=900
```

---

## 7. Figma 이미지 적용 시 주의사항 (2026-05-26 발견)

> `upload_assets` MCP에 `nodeId`를 지정해도 fill이 **자동 적용되지 않음**.
> 업로드 후 받은 `imageHash`를 `use_figma`로 노드의 `fills`에 명시적으로 설정해야 함.

```js
// 정상 패턴
node.fills = [{
  type: 'IMAGE',
  scaleMode: 'FILL',  // 또는 'FIT', 'CROP', 'TILE'
  imageHash: '<업로드 후 받은 hash>'
}];
```

---

## 8. 갱신 로그

| 일자 | 변경 내용 |
|------|-----------|
| 2026-05-26 | 매니페스트 초기 생성 — 템플릿 3개(promotion, oak_table, newarrival) + 데코 1개(sparkle) + 매핑 사전 + Figma fills 적용 주의사항 |

---

## 9. TODO (우선순위 순)

### P1. 다음 세션 즉시
- [ ] 5월 26일 작업한 4개 썸네일의 viewer URL 보충
  - T4 인스타 이벤트 (4658:1807) → `invitation/?`
  - T4 개인화 초대장 (4659:1807) → `invitation/?`
  - T4 모바일 카탈로그 (4671:1807) → `catalog/?`
  - T1 사전예약 신청 (4678:1807) → `guide/?`
- [ ] § 4.1 Thiings 우선 데코 5~7개 미리 다운로드 → `attachments/decorations/` 저장

### P2. 1~2주 이내
- [ ] § 3 기능 캡처 라이브러리 초기 5~10개 구축 (수동 캡처)
- [ ] § 4.2 Memoji 컬렉션 추출 (Mac Apple Memoji 4~6개)
- [ ] 매핑 사전 검증 — 실제 5~10개 신규 썸네일 제작 시 자동 매핑 정확도 측정

### P3. 장기 (선택)
- [ ] CdBd 사이트맵 자동 동기화 스크립트 PoC (Next.js RSC payload 분석 또는 sitemap.xml 활용)
- [ ] 매니페스트 → JSON 변환 스크립트 (프로그래매틱 활용)

---

**Status:** 🌱 Seed — 초기 골격 (자산 4개, 매핑 사전 1차 작성)
**Last Updated:** 2026-05-26
