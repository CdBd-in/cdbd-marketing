# 3. 소개서 — 씨디비디 PPT 제작 스킬 모음

씨디비디 소개서·발표 자료를 만들 때 쓰는 Claude(Cowork) 스킬 2종을 이 폴더에 보관합니다. 같은 볼트를 공유하는 팀원 누구나 여기서 파일을 열어 내용을 확인하고, `.skill` 파일로 각자 Claude 계정에 설치할 수 있습니다.

> 참고: 스킬은 각자의 Claude(Cowork) 계정에 개별 설치해야 작동합니다. 이 폴더는 팀 공용 원본 보관소입니다. 볼트에 넣어둔다고 자동으로 켜지지는 않습니다.

## 담긴 스킬

### 1) ppt-researcher (자료조사 전문가)
발표·소개서·보고서용 사전 자료조사를 수행하고, 슬라이드에 바로 얹을 수 있는 **자료조사 브리프**(출처 포함)를 Markdown 아티팩트로 출력합니다. 주제를 받으면 먼저 대상·목적·분량·범위를 확인한 뒤, 웹을 검색해 핵심 정보·통계·사례·트렌드를 정리합니다. 결과 브리프는 아래 PPT 제작 스킬에 그대로 넘길 수 있습니다.
- 폴더: `ppt-researcher/`
- 설치 파일: `ppt-researcher/ppt-researcher.skill`
- 읽을 문서: `ppt-researcher/SKILL.md`, `ppt-researcher/brief-template.md`

### 2) cdbd-ppt-generator (씨디비디 소개서 제작)
씨디비디 브랜드 규칙(퍼플 #6C4CFF, Pretendard, 굵기 상한 Bold, 26pt 제목·행간 114%, 아이브로우+챕터+러닝푸터, 심플한 아이콘·도형 중심)을 지키는 **편집 가능한 .pptx** 소개서를 생성합니다. Keynote·PowerPoint에서 열립니다.
- 폴더: `cdbd-ppt-generator/`
- 설치 파일: `cdbd-ppt-generator/cdbd-ppt-generator.skill`
- 읽을 문서: `cdbd-ppt-generator/SKILL.md`, `cdbd-ppt-generator/design-system.md`, `cdbd-ppt-generator/cdbd_deck.js`

## 추천 사용 흐름
1. `ppt-researcher`로 주제 자료조사 → 브리프 아티팩트 확보
2. `cdbd-ppt-generator`로 그 브리프를 받아 브랜드 소개서(.pptx) 생성
3. 필요 시 Keynote에서 열어 다듬고 `.key`로 저장

## 설치 방법 (팀원용)
1. 이 폴더에서 해당 스킬의 `*.skill` 파일을 연다(또는 Claude 데스크탑 앱으로 보낸다).
2. 파일 카드의 **Save skill** 버튼을 눌러 본인 Claude 계정에 설치한다.
   - 버튼이 없으면 조직 설정에서 스킬 생성이 허용되어야 함(관리자 문의).
3. 설치 후 "씨디비디 소개서 만들어줘", "○○ 주제로 발표 자료조사 해줘"처럼 요청하면 자동으로 스킬이 사용된다.

## 폰트 안내
`cdbd-ppt-generator`가 만드는 .pptx는 **Pretendard**를 사용합니다(폰트는 `.skill` 패키지 안에 포함). 만든 덱을 Keynote/PowerPoint에서 정확히 보려면 각자 PC에 Pretendard가 설치되어 있어야 합니다(macOS는 Font Book으로 설치).

_최종 업데이트: 이 폴더의 스킬은 씨디비디 홈페이지(home.cdbd.in) 기준으로 제작되었습니다._
