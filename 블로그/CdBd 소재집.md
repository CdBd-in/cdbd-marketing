---
tags:
  - design-system
  - 소재집
  - blog
  - automation
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[블로그/썸네일 디자인 시스템]]"
---

# CdBd 소재집

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
> **카테고리 총 5개 / 템플릿 총 17개** (2026-05-26 기준 — 슬러그 17/17 ✅ 확보)
> **슬러그 추출 방법**: 카테고리 페이지 HTML → RSC payload (`self.__next_f.push`) → unescape → `"url_slug":"..."` 정규식

### 2.1. 프로필·명함 (`profilelink`) — 7개

| # | 슬러그 | 브랜드·핵심 카피 | 태그 | viewer URL | 사용 이력 |
|---|--------|-----------------|------|------------|-----------|
| 1 | `promotion` | **A1 시큐리티** / 프로모션 노출과 상담 신청으로 전환을 만드는 영업용 명함 | #명함 #영업 #B2B #보안 #프로모션 #상담신청 | https://www.cdbd.in/templates/profilelink/promotion/viewer | 2026-05-26 T2 명함·브로셔 |
| 2 | `intake` | **원페이지 설문형** / 고객 데이터를 종합화하기 | #명함 #설문 #리드수집 #데이터 | https://www.cdbd.in/templates/profilelink/intake/viewer | — |
| 3 | `corporate` | **FINDERS** / 원클릭 연락처 저장으로 선점하는 비즈니스 기회 | #명함 #연락처저장 #B2B #기업 #네트워킹 | https://www.cdbd.in/templates/profilelink/corporate/viewer | — |
| 4 | `dental` | **SMILING (치과·의료)** / 복잡한 홈페이지 대신 핵심 진료 정보부터 정리해 보여주기 | #명함 #의료 #병원 #치과 #진료정보 | https://www.cdbd.in/templates/profilelink/dental/viewer | — |
| 5 | `portfolio` | **포트폴리오형** / 연락처와 작업 이력을 한 번에 확인 | #명함 #포트폴리오 #프리랜서 #크리에이터 #작업이력 | https://www.cdbd.in/templates/profilelink/portfolio/viewer | — |
| 6 | `campaign` | **캠페인·사업 소개** / 연락처를 넘어, 진행하는 사업과 캠페인을 소개 | #명함 #캠페인 #사업소개 #SNS | https://www.cdbd.in/templates/profilelink/campaign/viewer | — |
| 7 | `sales` | **김도현 B2B 영업** / 모바일 명함으로 실제 전환율 40% 상승 | #명함 #B2B #영업 #성과강조 #케이스스터디 | https://www.cdbd.in/templates/profilelink/sales/viewer | — |

### 2.2. 홍보·카탈로그 (`catalog`) — 4개

| # | 슬러그 | 브랜드·핵심 카피 | 태그 | viewer URL | 사용 이력 |
|---|--------|-----------------|------|------------|-----------|
| 1 | `oak_table` | **Premium Oak Dining Table** / 제품 정보 전달과 고객 문의 연결을 위한 디지털 상세 페이지 | #브로셔 #카탈로그 #가구 #프리미엄 #제품상세 #따뜻한톤 | https://www.cdbd.in/templates/catalog/oak_table/viewer | 2026-05-26 T2 명함·브로셔 |
| 2 | `lookbook` | **BLUE NOTE** / 시즌 컬렉션과 매장 정보 감각적으로 전달하기 | #카탈로그 #패션 #시즌컬렉션 #룩북 #매장정보 | https://www.cdbd.in/templates/catalog/lookbook/viewer | — |
| 3 | `newarrival` | **The ELXE Lab — BEYOND LIQUID** / 신제품 소개부터 구매 유도, 매장 안내까지 하나의 흐름으로 | #카탈로그 #뷰티 #신제품 #구매유도 #신상 | https://www.cdbd.in/templates/catalog/newarrival/viewer | (디자인 시스템 노트 예시) |
| 4 | `online_lookbook` | **SUNGROVE CLUB** / 화보 감성 그대로, 제품 탐색부터 쿠폰까지 | #카탈로그 #패션 #화보 #룩북 #쿠폰 #온라인 | https://www.cdbd.in/templates/catalog/online_lookbook/viewer | — |

### 2.3. 초대·예약 (`invitation`) — 5개

| # | 슬러그 | 브랜드·핵심 카피 | 태그 | viewer URL | 사용 이력 |
|---|--------|-----------------|------|------------|-----------|
| 1 | `seminar` | **The Heritage Summit** / VIP를 위한 맞춤 초대장으로 행사의 품격 높이기 | #초대장 #VIP #행사 #서밋 #프리미엄 #세미나 | https://www.cdbd.in/templates/invitation/seminar/viewer | — |
| 2 | `reservation` | **갤러리 예약형** / 예약형 초대장으로 방문 일정 조율 완전 자동화 | #초대장 #예약 #갤러리 #일정조율 #자동화 | https://www.cdbd.in/templates/invitation/reservation/viewer | — |
| 3 | `rsvp` | **Olive Pattern · 메리언** / RSVP 접수형 템플릿으로 초대와 참석 관리를 한 번에 | #초대장 #RSVP #참석관리 #이벤트 #접수 | https://www.cdbd.in/templates/invitation/rsvp/viewer | _Figma 4658:1807 (인스타 이벤트) 가능성_ |
| 4 | `personalized` | **THE SIGNATURE DAY · Snowst** / 고객의 이름이 담긴 초대장으로 참석율 2배 만들기 | #초대장 #개인화 #참석율 #VIP #이름삽입 | https://www.cdbd.in/templates/invitation/personalized/viewer | _Figma 4659:1807 (개인화 초대장) 가능성_ |
| 5 | `buttery_moment` | **Buttery Moment · 팝업** / 개발 없이 구축하는 우리 브랜드 팝업 스토어 예약 시스템 | #초대장 #팝업스토어 #브랜드 #예약시스템 #F&B | https://www.cdbd.in/templates/invitation/buttery_moment/viewer | — |

### 2.4. 소식·매거진 (`magazine`) — 0개

> 카테고리는 존재하지만 **아직 템플릿 없음**. CdBd 안내: "이 카테고리에는 아직 템플릿이 없어요"
> 매핑 시 fallback 처리 필요 — 다른 카테고리로 대체 or 3D 오브젝트로 우회

### 2.5. 가이드·신청 (`guide`) — 1개

| # | 슬러그 | 브랜드·핵심 카피 | 태그 | viewer URL | 사용 이력 |
|---|--------|-----------------|------|------------|-----------|
| 1 | `b2b-contract` | **가맹 사업 동의·서명** / 가맹 사업 중 발생하는 각종 동의와 서명을 모바일에서 한 번에 | #신청서 #가맹사업 #동의서 #서명 #폼 #B2B #계약 | https://www.cdbd.in/templates/guide/b2b-contract/viewer | _Figma 4678:1807 (사전예약 신청) 가능성_ |

---

### 📌 자동 매핑 가이드 (Claude용)

타이틀 키워드 → 슬러그 1차 매칭:

| 타이틀 키워드 | 카테고리 / 슬러그 후보 |
|--------------|---------------------|
| "명함", "프로필" (일반) | `profilelink/promotion` 또는 `corporate` |
| "B2B 영업", "전환율" | `profilelink/sales` 또는 `corporate` |
| "포트폴리오", "프리랜서" | `profilelink/portfolio` |
| "병원", "치과", "의료" | `profilelink/dental` |
| "캠페인" | `profilelink/campaign` |
| "리드 수집", "설문" | `profilelink/intake` |
| "브로셔", "카탈로그", "제품 상세" | `catalog/oak_table` (프리미엄) 또는 `newarrival` |
| "룩북", "패션", "컬렉션" | `catalog/lookbook` 또는 `online_lookbook` |
| "신제품", "신상" | `catalog/newarrival` |
| "VIP 행사", "세미나" | `invitation/seminar` |
| "예약", "방문" | `invitation/reservation` |
| "RSVP", "참석 관리", "이벤트 신청" | `invitation/rsvp` |
| "개인화 초대장", "이름 삽입" | `invitation/personalized` |
| "팝업 스토어" | `invitation/buttery_moment` |
| "신청서", "동의서", "서명", "가맹" | `guide/b2b-contract` |

### 🔁 슬러그 추출 방법 재현 (다음에 신규 템플릿 추가 시)

```bash
# 1. 카테고리 페이지 HTML 받기 (User-Agent 필수)
curl -sL "https://www.cdbd.in/templates/{category}" -A "Mozilla/5.0 ..." -o page.html

# 2. RSC payload unescape 후 url_slug 추출
python3 -c "
import re
content = open('page.html').read()
pushes = re.findall(r'self\.__next_f\.push\(\[1,\"((?:[^\"\\\\\\\\]|\\\\\\\\.)*)\"\]\)', content)
data = ''.join(pushes).replace('\\\\\"', '\"').replace('\\\\\\\\', '\\\\').replace('\\\\n', '\\n')
print(set(re.findall(r'\"url_slug\":\"([a-zA-Z0-9_-]+)\"', data)))
"
```

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
| 2026-05-26 | 소재집 초기 생성 — 템플릿 3개(promotion, oak_table, newarrival) + 데코 1개(sparkle) + 매핑 사전 + Figma fills 적용 주의사항 |
| 2026-05-26 | § 2 템플릿 카탈로그 보충 — templates/all 캡처 기반 17개 템플릿 한글 카피·태그 정리 (slug는 3개만 확보, 14개 TBD) |
| 2026-05-26 | § 2 슬러그 17/17 ✅ 완료 — RSC payload(`self.__next_f.push`) 파싱으로 모든 `url_slug` 자동 추출 + viewer URL 17개 모두 확정 + 자동 매핑 가이드 추가 |

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
- [ ] 소재집 → JSON 변환 스크립트 (프로그래매틱 활용)

---

**Status:** 🌿 Growing — § 2 17개 템플릿 풀 매핑 완료 (slug 17/17 ✅, 캡처 2/17, 자동 매핑 가이드 1차)
**Last Updated:** 2026-05-26
