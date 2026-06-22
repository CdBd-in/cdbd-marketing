---
type: 제작 시안 (콘텐츠)
seed: "#01 BTS V × 올인컴플리트"
project: CdBd 매거진
format: "4:5 (1080×1350), 8장"
parent: "[[CdBd 매거진/04. 콘텐츠 기획 가이드.md]]"
tags:
  - cdbd-매거진
  - 제작-시안
updated: 2026-06-22
---

# 제작 시안 — #01 BTS V × 올인컴플리트

[[CdBd 매거진/04. 콘텐츠 기획 가이드.md|콘텐츠 기획 가이드]]의 백로그 1번. **8비트 = 8장**으로 1:1 매핑.
구성: **표지 1 + 본문 6 + 뒷표지 1 = 8장** (4:5 / 1080×1350).

## ✅ Figma 제작 완료
- **파일**: CdBd 매거진 템플릿 (`LELC0pOv0iH80Ec7GKkalk`)
- **페이지**: `제작 — #01 올인컴플리트` (node `2458-23`) · [Figma 열기](https://www.figma.com/design/LELC0pOv0iH80Ec7GKkalk/CdBd-매거진-템플릿?node-id=2458-23)
- **프레임 8장**: 표지 `2458-24` / 누가 `2458-42` / 문제 `2458-50` / 데이터 `2458-59` / 결과 `2458-67` / 해법 `2458-74` / 일반화 `2458-83` / 뒷표지 `2458-93`
- 적용: 텍스트 8장 채움 · 실제 이미지/아이콘 fill(별도 레이어, 여백 없이 풀필) · 결과/뒷표지 가독성 스크림 추가 · 뒷표지 로고 화이트 처리
- 데이터 페이지 이미지: CdBd 실제 페이지 히어로 밴드(`allincomplete-cdbd-page-band.png`, 상단 각짐)

## 적용 규칙 체크 ([[CdBd 매거진/00. 페이지 유형 가이드.md|공통 작업 규칙]])
- ✅ 표지 = `Cover-IMG BG`(기본값) · 뒷표지 = `BackCover-IMG BG`(짝)
- ✅ **포인트 컬러 1색으로 세트 내 통일** (제목 하이라이트·강조)
- ✅ **출처 있는 이미지는 모두 표기** (아래 이미지 자산 표)
- ✅ 이미지는 **부모 프레임 fill ❌ → 내부 이미지 레이어**, clip 전제로 **여백 없이 가득**
- ✅ **인물 사진 = 룩북 배치 규칙** (`cdbd-design-service/룩북/2-4. 화보·상품.md`)

---

## 8장 구성표

| # | 비트 | 유형 | 텍스트 (슬롯) | 이미지 |
|---|------|------|---------------|--------|
| 1 | HOOK | **Cover-IMG BG** | 제목: **BTS V가 산 그 모자, 첫 매장 문 여는 날** · 설명: (없음) | `allincomplete-cover.jpg` (네이비 볼캡 착용 모델) |
| 2 | 누가 | **Body-Half** (이미지↑/텍스트↓) | 소제목: **올인컴플리트** · 본문: BTS V가 착용해 화제가 된 모자 브랜드. 첫 플래그십 매장을 연다. | `allincomplete-product.jpg` (네이비 볼캡 제품컷) |
| 3 | 문제 | **Body-Texture BG-Illust** | 소제목: 기존 방식의 벽 · 본문(3): ① 종이 초대장 — 인쇄·발송·재고 ② SNS 공지 — 누가 올지 모름 ③ 자체 페이지 — 개발 2주 | Thiings ×3 **흑백 처리**: `envelope`·`question-mark`·`hourglass` |
| 4 | 데이터 | **Body-Full Bleed** (black BG) | 소제목: 한 페이지에 다 담았다 · 본문: 초대장 · 룩북 · RSVP 응답 카드까지, 하나의 모바일 페이지로. | **검정 배경 + CdBd 실제 페이지 목업**(`allincomplete-cdbd-page.png`, 여백 두고 띄움·상단 각짐) + 하단 dim 그라데이션 + 텍스트 |
| 5 | 결과 | **Body-Half** (이미지↑/텍스트↓) | 소제목: **매장 오픈 전, 모바일 한 페이지로** · 본문: 룩북·초대·예약을 따로 두지 않고, 흩어진 정보를 한 곳에서. · 출처 | `allincomplete-lookbook2.jpg` (라이트블루 볼캡 화보) |
| 6 | 해법 | **Body-Texture BG-Illust** | 소제목: **CdBd가 한 일** · 본문(3): ① 초대 + 룩북 한 페이지 ② 응답 카드로 RSVP 자동 수집 ③ 디자이너 없이 5분 제작 | Thiings ×3 **컬러**: `mobile-phone`·`clipboard`·`lightning` |
| 7 | 일반화 | **Body-Texture BG-Article** | 제목: 브랜드의 시작은 페이지부터 · 본문(아티클) · `7/8` | `allincomplete-lookbook1.jpg` (라이트블루 볼캡 화보) |
| 8 | CTA | **BackCover-IMG BG** | 마무리: **전체 사례 → 프로필 링크 · home.cdbd.in** · 로고 `CdBd mag.`(화이트) | `allincomplete-navy-2.jpg` (네이비 볼캡 측면 — 표지와 다른 컷) |

> **장수 조절 메모**: 표준 8장 풀스토리. 더 짧게(6장) 가려면 §기획가이드 깊이전략대로 4·7 비트를 통합·생략.

### v3 수정 반영 (2026-06-22)
- **본문 배경 타입 통일 → solid 다크 차콜(#1A1A1A), 흰 텍스트** (img/texture 혼용 제거)
- 03·06·07: 텍스처 → **차콜 solid** 배경 전환
- 04: 목업 **사이즈 축소(아래까지 더 보임) + 상단 모서리 둥글게(뷰어형) + 차콜 배경/스트로크/그림자로 캡처본과 분리**
- 02: 단일 제품컷 → **제품 누끼 콜라주**(네이비캡·레몬캡·차콜캡·브라운비니·아이보리비니)
- 서로 다른 제품으로 교체: 05=비치버킷햇, 07=니트탑, 08=데님 사파리햇 (1·2·8 / 5·7 제품 중복 해소)
- 03·06 하이라이트 바 → 포인트 컬러(핑크) 적용

### v2 수정 반영 (2026-06-22)
- 이미지 중복 제거: 1·2·8 / 5·7 모두 서로 다른 컷 (8번 → 네이비 측면컷 `navy-2`)
- 문제(03) ↔ 해법(06) 시각 구분: **문제 아이콘 흑백 / 해법 아이콘 컬러**
- 03 아이콘 `megaphone`→`question-mark`(맥락: 누가 올지 모름), 06 `stopwatch`→`lightning`(빠름)
- 03·06 제목 하이라이트 바 위치·폭 교정 (제목 글자폭에 맞춤)
- 04↔05 페이지 유형 스왑: 04=Full Bleed(검정+목업+dim), 05=Body-Half

---

## 이미지 자산 & 출처

모두 **실제 올인컴플리트(ALLINCOMPLETE) 공식 판매 이미지**. 저장: `~/Downloads/cdbd-allincomplete/` (볼트 외부).

| 파일 | 내용 | 샷 타입 → 배치 | 출처 |
|------|------|---------------|------|
| `allincomplete-cover.jpg` | 네이비 데님 볼캡 착용 모델 (베이지 배경) | 바스트샷 → 규칙 D(사이즈↑·머리 보호·좌우 중앙) | 무신사 [라운드 로고 볼캡(진청)](https://www.musinsa.com/products/2805868) |
| `allincomplete-product.jpg` | 네이비 데님 볼캡 단독 제품컷 | 제품컷 → 여백 없이 풀필 | 무신사 [라운드 로고 볼캡(진청)](https://www.musinsa.com/products/2805868) |
| `allincomplete-lookbook1.jpg` | 라이트블루 볼캡 착용 모델 (퍼프 블라우스) | 바스트샷 → 규칙 D | 무신사 [라운드 로고 볼캡(연청)](https://www.musinsa.com/products/2435766) |
| `allincomplete-lookbook2.jpg` | 라이트블루 볼캡 착용 모델 (화이트 원피스) | 웨이스트샷 → 규칙 C(정중앙·머리 상단 여백) | 무신사 [라운드 로고 볼캡(연청)](https://www.musinsa.com/products/2435766) |
| `allincomplete-cdbd-page.png` | **CdBd로 제작한 실제 플래그십 초대 페이지** 모바일 목업 (상단 모서리 각짐 처리) | 페이지 목업 → 상단 모서리 맞춰 위에서 블리드 | CdBd [allincomplete_FlagshipStore/Invitation](https://www.cdbd.in/allincomplete_FlagshipStore/Invitation) |
| `allincomplete-cdbd-page-hero.png` | 위 페이지 상단 히어로만 크롭 (760×1000) | 데이터 슬롯 tight 옵션 | CdBd (동일 페이지) |

- 브랜드 공식몰: <https://www.allincomplete.com/>
- 카드뉴스 본문/캡션에 표기할 출처 문구(예): `*출처: ALLINCOMPLETE`

### Thiings 3D 아이콘 (3·6번 페이지) — ✅ 확정·다운로드 완료
[[CdBd 매거진/02. 본문(Body).md|본문]] Illust 규칙대로 Thiings에서 소싱. 저장: `~/Downloads/cdbd-allincomplete/thiings-{slug}.png` (1024×1024, 투명 배경).

| 페이지 | 슬롯 | 아이콘 | 파일 |
|--------|------|--------|------|
| 3 문제 | ① 종이 초대장 — 인쇄·발송·재고 | 봉투 | `thiings-envelope.png` |
| 3 문제 | ② SNS 공지 — 누가 올지 모름 | 확성기 | `thiings-megaphone.png` |
| 3 문제 | ③ 자체 페이지 — 개발 2주 | 모래시계 | `thiings-hourglass.png` |
| 6 해법 | ① 초대+룩북 한 페이지 | 스마트폰 | `thiings-mobile-phone.png` |
| 6 해법 | ② RSVP 자동 수집 | 클립보드 체크리스트 | `thiings-clipboard.png` |
| 6 해법 | ③ 디자이너 없이 5분 제작 | 스톱워치 | `thiings-stopwatch.png` |

> 출처: [Thiings](https://www.thiings.co/things) (무료 3D 아이콘). 아이콘은 출처 표기 대상 아님(상징 모티프).

---

## ⚠️ 확인 필요 / 메모
1. **BTS V 실사진 미사용** — 셀럽 초상권 이슈로 V 직접 사진은 넣지 않고, 화제의 **브랜드 제품/모델 화보**로 대체. 텍스트(HOOK·누가)에서만 V 언급. *(필요 시 V 관련 공식 협찬 이미지가 있으면 교체)*
2. **브랜드 이미지 사용 권한** — 위 이미지는 ALLINCOMPLETE 공식 판매컷. 실제 발행 전 **사례 당사자(브랜드) 사용 동의** 확인 권장(자사 사례이므로 통상 가능).
3. **4번 데이터 페이지** — ✅ **해결**. CdBd 실제 제작 페이지([allincomplete_FlagshipStore/Invitation](https://www.cdbd.in/allincomplete_FlagshipStore/Invitation))를 모바일 목업으로 캡처, **상단 모서리 각지게** 처리해 적용. 카드 상단에 모서리 맞춰 위에서 블리드.
4. **포인트 컬러** — 브랜드 로고가 핑크/마젠타 톤이라, 세트 포인트 컬러를 그에 맞춰 1색 통일도 자연스러움(최종 1색은 템플릿에서 확정).
