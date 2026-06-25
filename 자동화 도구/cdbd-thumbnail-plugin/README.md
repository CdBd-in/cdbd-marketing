# CdBd 블로그 썸네일 자동 제작 Figma Plugin

[[1. 블로그/썸네일/0. 목표와 비전]] §⚙️ 파이프라인의 **5단계 (N안 자동 제작)** 를 담당하는 Figma 데스크탑 플러그인. `use_figma` (Figma MCP)가 변경을 commit하지 못하는 한계를 우회한다.

## 등록 (Figma Desktop에서)

1. Figma 데스크탑 앱 실행
2. 메뉴: **Plugins → Development → Import plugin from manifest…**
3. 이 폴더의 `manifest.json` 선택
4. 등록 완료. 메뉴에서 `CdBd 블로그 썸네일 자동 제작` 발견 가능

## 실행

1. **`CdBd-블로그-썸네일`** Figma 파일(`qRFc2HpQ4Mp562LQMB8BX0`) 열기
2. **Plugins → Development → CdBd 블로그 썸네일 자동 제작** 실행
3. UI에 다음 입력:
   - **타이틀** (줄바꿈은 `\n` 표기) — 예) `전 세계 파트너를 사로잡는\nCdBd 모바일 명함`
   - **서브타이틀** — 시리즈면 입력, 단독 글이면 비움
   - **강조어** — 타이틀 안의 강조 문구 ([[1. 블로그/썸네일/1. 디자인 가이드/1-1. 스타일]] 강조 키워드 선택 원칙 참고)
   - **변형 매트릭스 JSON** — Claude가 분석으로 제안한 자산 후보 × 슬롯 변형 매트릭스
4. **4안 자동 제작 ▶** 클릭
5. 출력 페이지(`26:2`)의 앵커 `x=-3500 / y=23537`(**y=23537 밑 고정**, `OUTPUT_BASE_X`·`OUTPUT_BASE_Y`)에 N안이 자동 생성됨

## 변형 매트릭스 JSON 예시

```json
[
  {"slotId": "338:3131", "imageHash": "1f0dd12ff1dab6ba707bdca34639a615078db56f", "name": "안1_corporate_상단·서브"},
  {"slotId": "338:3107", "imageHash": "1f0dd12ff1dab6ba707bdca34639a615078db56f", "name": "안2_corporate_하단·서브"},
  {"slotId": "338:3131", "imageHash": "bfcaf900ee18a3ba009a0ac49d532b0d26d477d2", "name": "안3_promotion_상단·서브"},
  {"slotId": "338:3107", "imageHash": "bfcaf900ee18a3ba009a0ac49d532b0d26d477d2", "name": "안4_promotion_하단·서브"}
]
```

- **`slotId`**: 슬롯 페이지(`338:3221`)의 16종 슬롯 중 하나. UI의 슬롯 ID 칩 클릭 시 클립보드 복사.
- **`imageHash`**: Figma `upload_assets`로 업로드 후 받는 hash. Claude가 분석 후 안내.
- **`name`**: 결과 레이어 이름. 사용자 검수 시 식별용.

## 동작 원리

각 변형마다:

1. `slotId` 슬롯을 `clone()` → 슬롯 페이지에 `appendChild`
2. 내부 `VISUAL_SLOT` 찾아 `imageHash`로 `IMAGE` fill (scaleMode: FILL)
3. 내부 `TITLE` 텍스트에 `title` 채우기 + `emphasis` 문구 색상 적용
   - 서브타이틀 있음 → 그린 `#4DE98B`
   - 서브타이틀 없음 → 퍼플 `#8F80FF`
4. 내부 `SUBTITLE` 텍스트에 `subtitle` 채우기 (있을 때만)

## 잔재 프레임 자동 정리 (2026-06)

자산을 가져오는 과정에서 템플릿 페이지(`338:3221`)에 남는 캡처·미리보기 프레임(예: `full`, `hero`, `thiings-*`, `c5-*` — 보통 400×300)을 자동으로 청소한다.

- **판별 기준**: 템플릿 페이지의 최상위 `FRAME` 중 정식 슬롯 16종(`TEMPLATE_SLOT_IDS = SLOT_TYPE_MAP` 키)에 **없는** 것 → 잔재로 간주해 제거. 슬롯 16종은 ID 허용목록으로 보존되므로 안전.
- **자동 실행**: `4안 자동 제작 ▶`(`createVariants`) 및 AI 이미지 생성(`createVariantsFromImageData`) 시작 시 `cleanupStrayFrames()`가 먼저 돌아 페이지를 청소한다.
- **수동 실행**: UI의 `🧹 잔재 프레임 정리` 버튼 → 제거 개수·이름 표시.

## 한계 / TODO

- ⚠️ **공식 목업 컴포넌트(`1:1368/9/70`) 자동 인스턴스 미적용** — 현재는 슬롯의 `VISUAL_SLOT` 자체에 직접 fill. 목업 프레임 안의 `#FFFFFF` rect에 fill하려면 컴포넌트 인스턴스 생성 단계 필요 (다음 버전)
- ⚠️ **보조 이미지(데코·Memoji) 동적 배치 미적용** — [[1. 블로그/썸네일/1. 디자인 가이드/1-3. 이미지 규칙|1-3. 이미지 규칙]] §1.2.a 알고리즘 미구현 (다음 버전)
- ⚠️ **줄 나누기 자동 미적용** — 타이틀의 `\n`은 Claude가 미리 결정해서 input으로 받아야 함

## Claude → Plugin 연계 패턴

```
[Claude]
1. 타이틀 분석 → 유형 + 자산 후보 + 강조어 + 줄 나누기 결정
2. Microlink 캡처 → vault 저장
3. Figma upload_assets로 업로드 → imageHash 받기
4. 변형 매트릭스 JSON 생성

[사용자]
5. Plugin UI에 input 붙여넣기 → 실행
6. 결과 검수 + 1개 선택
```
