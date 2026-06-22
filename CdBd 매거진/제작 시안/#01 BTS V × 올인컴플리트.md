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
| 3 | 문제 | **Body-Texture BG-Illust** | 소제목: 기존 방식의 벽 · 본문(3): ① 종이 초대장 — 인쇄·발송·재고 ② SNS 공지 — 누가 올지 모름 ③ 자체 페이지 — 개발 2주 | Thiings 아이콘 ×3 (아래 키워드) |
| 4 | 데이터 | **Body-Half** (이미지↑/텍스트↓) | 소제목: 한 페이지에 다 담았다 · 본문: 초대장 + 룩북 + RSVP 응답 카드까지, 하나의 모바일 페이지로. | `allincomplete-cdbd-page.png` (**CdBd 실제 제작 페이지** 목업, 상단 모서리 각짐) — 상단 슬롯에 모서리 맞춰 위에서 블리드. tight 옵션: `allincomplete-cdbd-page-hero.png` |
| 5 | 결과 | **Body-Full Bleed** (제목 오버레이) | 제목: **매장 오픈 전, 모든 정보를 모바일 한 페이지로** · 본문: 룩북·초대·예약을 따로 두지 않고. | `allincomplete-lookbook2.jpg` (라이트블루 볼캡 화보) |
| 6 | 해법 | **Body-Texture BG-Illust** | 소제목: **CdBd가 한 일** · 본문(3): ① 초대 + 룩북 한 페이지 ② 응답 카드로 RSVP 자동 수집 ③ 디자이너 없이 5분 제작 | Thiings 아이콘 ×3 (아래 키워드) |
| 7 | 일반화 | **Body-Texture BG-Article** | 제목: 브랜드 런칭·플래그십 오픈을 준비 중이라면 · 본문: **페이지부터.** | (텍스트 중심 · 이미지 없음 또는 텍스처만) |
| 8 | CTA | **BackCover-IMG BG** | 마무리: **전체 사례 → 프로필 링크** · 로고 `CdBd mag.` · (작게) home.cdbd.in | `allincomplete-cover.jpg` (표지와 수미상관, 디밍) |

> **장수 조절 메모**: 표준 8장 풀스토리. 더 짧게(6장) 가려면 §기획가이드 깊이전략대로 4·7 비트를 통합·생략.

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

### Thiings 3D 아이콘 (3·6번 페이지)
[[CdBd 매거진/02. 본문(Body).md|본문]] Illust 규칙대로 Thiings에서 소싱 (`~/Downloads/{slug}.png`, 1:1).

| 페이지 | 슬롯 | Thiings 키워드(후보) |
|--------|------|----------------------|
| 3 문제 | ① 종이 초대장 | `envelope` / `letter` |
| 3 문제 | ② SNS 공지 | `smartphone` / `megaphone` |
| 3 문제 | ③ 개발 2주 | `laptop` / `code` |
| 6 해법 | ① 한 페이지 | `document` / `mobile` |
| 6 해법 | ② RSVP 자동 수집 | `checklist` / `inbox` |
| 6 해법 | ③ 5분 제작 | `stopwatch` / `magic-wand` |

---

## ⚠️ 확인 필요 / 메모
1. **BTS V 실사진 미사용** — 셀럽 초상권 이슈로 V 직접 사진은 넣지 않고, 화제의 **브랜드 제품/모델 화보**로 대체. 텍스트(HOOK·누가)에서만 V 언급. *(필요 시 V 관련 공식 협찬 이미지가 있으면 교체)*
2. **브랜드 이미지 사용 권한** — 위 이미지는 ALLINCOMPLETE 공식 판매컷. 실제 발행 전 **사례 당사자(브랜드) 사용 동의** 확인 권장(자사 사례이므로 통상 가능).
3. **4번 데이터 페이지** — ✅ **해결**. CdBd 실제 제작 페이지([allincomplete_FlagshipStore/Invitation](https://www.cdbd.in/allincomplete_FlagshipStore/Invitation))를 모바일 목업으로 캡처, **상단 모서리 각지게** 처리해 적용. 카드 상단에 모서리 맞춰 위에서 블리드.
4. **포인트 컬러** — 브랜드 로고가 핑크/마젠타 톤이라, 세트 포인트 컬러를 그에 맞춰 1색 통일도 자연스러움(최종 1색은 템플릿에서 확정).
