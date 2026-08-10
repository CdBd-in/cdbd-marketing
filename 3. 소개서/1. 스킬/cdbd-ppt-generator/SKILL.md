---
name: cdbd-ppt-generator
description: >-
  Build on-brand CDBD (씨디비디) presentation decks — company introduction decks (회사 소개서),
  sales/service proposals, product intros — as editable .pptx (opens natively in Keynote and
  PowerPoint). Use this skill whenever the user wants a 씨디비디/CDBD deck, 소개서, 제안서,
  slides, PPT, or presentation, or references the CDBD brand, the Pretendard font, or brand purple
  #6C4CFF — even if they don't say "skill". Produces slides that follow CDBD's exact design system:
  Pretendard only, weight capped at Bold, brand purple #6C4CFF, generous margins, the
  eyebrow + chapter-tag + running-footer chassis, and the measured type scale (title Bold 26pt,
  body 13pt/150%). Prefer this over generic deck-making for anything CDBD-branded.
license: Proprietary.
---

# CDBD Deck Builder

Build presentation decks that match the CDBD (씨디비디) brand system exactly. Output is **.pptx**, which opens natively and fully editable in **Keynote** (`File ▸ Open`, then save as `.key` if desired) and in PowerPoint. Default deck language is **Korean**; canvas is **16:9**.

CDBD is a mobile page builder SaaS (build → share → measure). Decks are usually company-introduction (회사 소개서) style: calm, product-first, one brand accent, dense where it matters (features/pricing/FAQ) but never crowded.

## Order of work

1. **Gather the content first.** Decide the deck's sections and write the actual Korean copy — headlines, feature descriptions, plan details, FAQ answers. If the user gave source material, extract from it; if facts are unknown (prices, metrics, counts), ask or mark them clearly as placeholders (예시) rather than inventing numbers. Do **not** fabricate statistics.
2. **Read `references/design-system.md`** — the full brand spec (colors, exact type scale, layout, components, do/don't). It is the source of truth; this file is the quick operating guide.
3. **Build with the bundled helper library** `scripts/cdbd_deck.js` (see below). It encodes every measured value, so you rarely set sizes by hand.
4. **Install the bundled fonts, then QA** (validate → render to images → look).

## Building with `scripts/cdbd_deck.js`

`pptxgenjs` is preinstalled. The helper library encodes the CDBD tokens, the exact type scale, and the common slide types, so you should build with it instead of re-deriving sizes. Copy it next to your generator (or require it by path) and compose slides:

```js
const D = require("./cdbd_deck.js");
const p = D.newPres();

// Cover
D.cover(p, { title: "씨디비디\n모바일 페이지 빌더",
             sub: "코딩 없이 만들고, 배포하고, 측정하는 비즈니스 모바일 페이지",
             contact: "home.cdbd.in   ·   help@cdbd.in" });

// Full-bleed purple statement + proof metrics
D.sectionMetrics(p, { headline: "링크인바이오도, 랜딩페이지도 아닌\n씨디비디.",
                      sub: "코딩도, 디자이너도 필요하지 않아요.",
                      metrics: [{fig:"노코드",label:"필요한 코딩은 0줄"}, {fig:"모바일",label:"화면 자동 최적화"}],
                      page: "02" });

// Standard content slide → returns the slide so you can add a body component
let s = D.content(p, { eyebrow: "씨디비디가 다른 점", chapter: "01  왜 씨디비디인가",
                       title: "가장 쉽고 빠른\n모바일 페이지 제작 도구",
                       lead: "링크인바이오와 랜딩페이지 빌더 사이, 그 중간의 빈자리를 채웁니다.", page: "03" });
D.threeCol(p, s, [ {label:"빠른 제작", title:"...", body:"..."}, /* 3 cards */ ]);

s = D.content(p, { eyebrow:"요금 안내", chapter:"05  요금 안내", title:"목적에 맞는 플랜을 선택하세요", lead:"...", page:"07" });
D.pricing(p, s, [ {note:"...", name:"싱글 페이지", features:"...", price:"0원"},
                  {note:"...", name:"멀티 페이지", features:"...", price:"월 19,000원~", highlight:true}, /* ... */ ]);

s = D.content(p, { eyebrow:"FAQ", chapter:"08  자주 묻는 질문", title:"자주 묻는 질문", page:"16" });
D.faq(p, s, [ {q:"...", a:"..."}, /* 6–12 */ ]);

await p.writeFile({ fileName: "cdbd_deck.pptx" });
```

Exposed helpers: `newPres()`, `cover()`, `sectionMetrics()`, `content()` (eyebrow + chapter + title + lead + footer; returns the slide), `threeCol()`, `pricing()`, `faq()`, `phone()`, `footer()`, plus tokens `C` (colors), `F` (font roles), `T` (type/layout constants). For a slide type the library doesn't cover, call `D.content(...)` for the header/footer chassis, then add your own `addText`/`addShape` **using the `C`/`F`/`T` tokens** so sizing stays on-spec.

## Non-negotiable brand rules (enforced by the library — keep them if you hand-write)

- **Pretendard only.** Weight ceiling is **Bold** — never ExtraBold or Black for text. Bold = `fontFace: "Pretendard", bold: true`; SemiBold/Medium use `"Pretendard SemiBold"` / `"Pretendard Medium"`.
- **One accent: brand purple `#6C4CFF`.** No second accent. On dark slides use `#9B7DFF`; pale fills use `#EEEAFB`.
- **Exact type scale:** content-slide title **Bold 26pt / line 1.14**; cover hero 44pt; full-bleed headline 40pt; card heading SemiBold 16pt / 1.2; body Regular 13pt / **1.5**; dense body 12pt / 1.45; lead 15pt muted; eyebrow 12pt SemiBold accent; chapter tag 12pt Medium muted; footer 9.5pt.
- **Chassis on every content slide:** eyebrow (accent, sub-topic) top-left + chapter tag (muted, `01 …`) top-right → title → muted lead → running footer `CDBD · HOME.CDBD.IN` + page number. Keep the **title→lead gap consistent** for one- and two-line titles (the library handles this).
- **Calm frame, worked interior.** Outer margin 0.85in stays constant. Alternate white/parchment and full-bleed purple for rhythm. One drop-shadow, only on the phone/UI mockup. No gradients, no decorative stripes, no accent underline beneath titles.

## 비주얼은 심플한 아이콘 & 도형 중심으로

이 덱의 그림은 **사진이나 복잡한 일러스트가 아니라, 단순한 아이콘과 기하 도형**으로 만든다. 이유는 세 가지다. 브랜드가 하나의 액센트(퍼플)와 여백으로 움직이는 미니멀 시스템이라 도형이 가장 잘 어울리고, 도형·아이콘은 pptxgenjs로 깨끗하게 그려져 어떤 환경에서도 동일하게 렌더되며, 사진·클립아트는 톤이 흔들리고 저작권 문제까지 생기기 때문이다. "심플하게"의 핵심은 요소를 늘리는 게 아니라, 몇 개의 단순한 형태로 의미를 전달하는 것이다.

원칙:
- **아이콘 타일 모티프.** 각 개념 앞에 `{colors.primary-tint}`(#EEEAFB) 라운드 사각 타일 안에 **선(line) 또는 단색 아이콘**을 넣는다. 아이콘은 **모노크롬 브랜드 퍼플** 한 색. 헬퍼 `iconTile()`이 기본 타일(추상 도형)을 그려주고, 실제 아이콘이 필요하면 아래 방식으로 PNG를 타일 안에 얹는다. 덱 전체에서 아이콘 스타일(선 굵기·모서리)을 **하나로 통일**한다.
- **도형으로 설명한다.** 프로세스·관계·구조는 라운드 사각형, 원, 얇은 선, 번호 배지, 화살표(작은 삼각형/`▸`) 같은 **기본 도형 조합**으로 다이어그램을 만든다. 타임라인은 번호 배지 + 연결선, 비교는 2단 카드, 흐름은 카드 + 화살표.
- **UI는 추상 목업으로.** 제품 화면은 실제 스크린샷 대신 `phone()` 헬퍼의 추상 목업(도형 블록 + 액센트 pill)으로 표현한다. 단 하나의 드롭섀도우는 이 목업에만.
- **절제.** 한 슬라이드에 아이콘/도형 모티프는 한 종류로. 3D·글로시·그라데이션·다색 아이콘·이모지 남발 금지. 형태는 납작하게(flat), 색은 퍼플·잉크·회색·틴트로 제한.

실제 선 아이콘이 필요할 때(pptx 스킬 방식): `react-icons`의 **선 계열 세트(Feather/Lucide 등)**를 골라 `ReactDOMServer.renderToStaticMarkup`으로 SVG를 만들고, 색을 `#6C4CFF`로 지정한 뒤 `sharp`로 ≥256px PNG로 래스터화해 `addImage({ data: "image/png;base64," + buf })`로 **아이콘 타일 안 중앙에** 얹는다(크기 타일의 약 55%). 한 세트에서만 고른다. 아이콘 없이도 성립하면 헬퍼의 기본 추상 타일로 충분하다 — 굳이 채우려 아이콘을 늘리지 않는다.

## Deck structure (default skeleton — expand/trim to the content; no fixed slide count)

Cover → overview/definition + proof (metrics or testimonials) → table of contents → problem/solution → 3-column differentiators → core features (as many as needed, numbered, with a UI mockup) → use cases → pricing → usage guide → admin/dashboard → production/process timeline → FAQ (densest) → footer/contact. Density opens sparse, rises through the middle, peaks at FAQ, resolves to a quiet footer. Full detail and the reference decks it's drawn from are in `references/design-system.md` (Deck Structure).

## Fonts

The nine Pretendard OTFs are in `assets/fonts/`. Install them before rendering so QA previews (and the user's Keynote/PowerPoint) show the real font:

```bash
mkdir -p /usr/share/fonts/pretendard && cp assets/fonts/*.otf /usr/share/fonts/pretendard/ && fc-cache -f
```

`.pptx` does not embed fonts by default. Note to the user that Pretendard must be installed on their machine for the deck to render correctly in Keynote/PowerPoint (they have the OTFs; on macOS, install via Font Book).

## QA (required)

Fonts installed, then from the pptx skill directory (`/root/.claude/skills/pptx`):

```bash
python scripts/office/validate.py cdbd_deck.pptx           # fix any fault in the generator, not by hand
python scripts/office/soffice.py --headless --convert-to pdf cdbd_deck.pptx
pdftoppm -jpeg -r 130 cdbd_deck.pdf slide                  # then view every slide-*.jpg
```

Look for: text overflow or clipping (most common), a two-line title crowding its lead, cards misaligned, low contrast, and — critically — any ExtraBold/Black weight or a non-#6C4CFF accent creeping in. Re-render only the slides you changed.

## Delivering to the user

Deliver the `.pptx` with `SendUserFile`. If they want it in Keynote, tell them to open it in Keynote (`File ▸ Open`) — everything stays editable and they can save as `.key`. Prices/metrics you couldn't verify should be flagged as placeholders (예시) for them to replace.
