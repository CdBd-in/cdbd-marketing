# CDBD Deck Design System

## Overview
CDBD's deck design language is a **reverent, product-first gallery** rendered on 16:9 slides. Every slide is a full-bleed "tile" — alternating light and near-black canvases, each anchored by a confident headline, a supporting line, and, where useful, a crisp product render or UI mockup. Nothing competes with the message. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive/emphasis elements use a single brand accent.

The one place CDBD deliberately departs from the Apple gallery it is inspired by is **density**. Apple's web pages run unusually airy — one idea per viewport. A sales/company-introduction deck cannot afford that: a reader flipping through a PDF needs the substance in front of them, not on the next slide. So CDBD keeps **body content dense and well-packed** — multi-column feature grids, parallel problem/solution lists, tight Q&A stacks — while preserving the calm surface treatment (restrained color, no decorative chrome, generous outer margins) that makes density feel organized rather than crowded. The rule of thumb: **the frame stays quiet; the content works hard.**

Slides retain one chassis but switch modes. Cover and section-divider slides breathe (sparse, headline-driven). Feature, usage-guide, pricing, and FAQ slides pack in structured content (columns, tables, numbered stacks). Across all slide types the typographic system, spacing rhythm, and the single accent stay consistent — this is one design language expressed at different volumes.

**Key Characteristics:**
- Message-first presentation; the frame recedes so the content can speak.
- Alternating full-bleed slide backgrounds: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- A single brand accent carries every emphasis, callout number, and CTA. No competing second accent.
- Two shape grammars: pill callouts/CTAs (fully rounded) and compact utility cards (small radius).
- **Pretendard only** across the whole deck — a nine-weight family that supplies every level of hierarchy. Negative letter-spacing at display sizes for a tight, modern headline feel.
- Whisper-soft elevation used only when a product/UI image needs to sit on a surface — essentially one drop-shadow in the entire system.
- Numbered section markers (`01`, `02`, …) echo the reference decks and create a sense of progression.
- Section rhythm across the deck: sparse cover → proof → agenda → dense middle (features/usage/pricing) → dense FAQ → quiet footer — a predictable pulse.

## Deck Structure
> **Source:** the two reference introduction decks (CDBD 소개서, MAKEVU QR 소개서). Both share the same backbone; use it as the default skeleton and expand or trim sections to fit the subject. **There is no fixed slide count** — build as many slides as it takes to explain the core content fully, and no more. A typical company-introduction deck lands around 11–16 slides.

Default section order:
1. **Cover / Hero** — one benefit-led headline, the product/company name, URL or contact, and a section index. Sparse and centered. This is the one slide that should feel empty.
2. **Overview / Definition + Proof** — a one-paragraph definition of what the product is, paired with social proof: either headline metrics (e.g. "100+ events · 200k+ participants · 2–3 day turnaround") or a stack of short customer testimonials.
3. **Table of Contents / Agenda** — a numbered list of the sections that follow. Vertical, quiet.
4. **Problem → Solution** — a two-column contrast: pain points on the left, CDBD's answer on the right, in parallel lines so the eye can pair them.
5. **Key Differentiators** — three columns, each a headline + a short explanatory paragraph. The "why us" slide.
6. **Core Features (multiple slides)** — numbered deep-dives. Each feature gets a heading, a dense supporting explanation, and a UI mockup or example where possible. This is the heart of the deck; use as many slides as the feature set needs.
7. **Use Cases / Case Studies** — three columns of concrete scenarios (e.g. popup, festival, conference), each with a short narrative.
8. **Pricing** — tiered comparison. Two or three plan columns with feature rows; note volume discounts / freemium entry point.
9. **Usage Guide / How it works** — the densest section: step sequences, collection methods, option lists, comparison tables. Mixed layouts are expected here.
10. **Admin / Dashboard** — a numbered list of admin capabilities with brief descriptions.
11. **Production / Onboarding Process** — a horizontal timeline of stages with duration estimates.
12. **FAQ** — dense two-column Q&A addressing technical, payment, and access concerns. Highest text density in the deck.
13. **Footer / CTA** — company details, contact, URL. Quiet, like the cover.

**Density progression:** open sparse for impact (cover, overview), raise density through the middle (features, usage, pricing), and let FAQ be the densest slide before the deck resolves to a quiet footer.

## Content Density
This is the section CDBD overrides most deliberately relative to the Apple source.

- **Fill the working slides.** On feature, usage, pricing, and FAQ slides, use the available column and row space. Prefer a three-column feature grid over three consecutive one-idea slides. Prefer a packed two-column Q&A over one question per slide.
- **Dense is not cramped.** Density comes from *content volume inside a calm frame*, never from shrinking outer margins or removing whitespace between blocks. Keep the outer margin (see Layout) constant; pack within it.
- **Parallel structure carries density.** When a slide holds a lot (problem/solution, plan comparison, FAQ), align items into parallel columns or rows so the reader scans rather than reads. Structure is what makes a dense slide legible.
- **Keep the cover and dividers sparse.** Density is for working slides. Cover, section dividers, and footer stay airy — the contrast is what gives the dense slides their punch.
- **Body copy stays readable.** Dense means more lines, not smaller-than-legible type. Hold body text at the sizes in the Typography table; gain density by using columns and tight-but-comfortable leading, not by dropping below the minimum body size.

## Colors
> The color system is one accent over a light/dark surface set. Only the surface-mode mix changes between slide types.

### Brand & Accent
- **Brand Accent** (`{colors.primary}` — **#6C4CFF**): CDBD's official brand purple, and the single brand-level emphasis color. Callout numbers, key stat figures, active section markers, links, and pill CTAs all use it. This is the deck's one "look here" signal — never introduce a second accent.
- **Accent on Dark** (`{colors.primary-on-dark}` — #9B7DFF): A brighter sibling used for the accent on near-black slides, where the base purple would sink into the background.
- **Accent Tint** (`{colors.primary-tint}` — #EEEAFB): A pale purple wash for accent-adjacent fills (mockup hero blocks, highlighted table headers, selected chips) — the accent at low volume.

### Surface
- **Pure White** (`{colors.canvas}` — #FFFFFF): The dominant slide background and card fill.
- **Parchment** (`{colors.canvas-parchment}` — #F5F5F7): The signature off-white. Used for alternating light slides and card zones so consecutive light slides still have rhythm. Just different enough from white to read as a change.
- **Near-Black Tile** (`{colors.surface-tile-1}` — #272729): The primary dark-slide background — for section dividers and high-impact statement slides.
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2A2A2C): A micro-step lighter, for a dark slide adjacent to another dark slide.
- **Pure Black** (`{colors.surface-black}` — #000000): Reserved for true void — full-bleed photographic overlays and video frames only.
- **Chip Gray** (`{colors.surface-chip}` — #D2D2D7): Base for translucent control chips over imagery (~64% alpha in use).

### Text
- **Near-Black Ink** (`{colors.ink}` — #1D1D1F): Every headline and body paragraph on light surfaces. Chosen over pure black to keep slides feeling photographic rather than printed.
- **Body on Dark** (`{colors.body-on-dark}` — #FFFFFF): All text on dark slides.
- **Body Muted** (`{colors.body-muted}` — #CCCCCC): Secondary copy on dark slides where pure white would be too loud.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Softer body on light surfaces (e.g. dense FAQ answers, captions).
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7A7A7A): Fine print, legal, disabled states, footer detail.

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #E0E0E0): The 1px border on utility cards, pricing-table cells, and column dividers.
- **Divider Soft** (`{colors.divider-soft}` — #F0F0F0): A softer ring tone for secondary surfaces; reads as a shadow rather than a hard line.

### Gradients
**No decorative gradients.** Depth comes from surface-color change and from real product/UI imagery, not from CSS-style gradient fills. Keep backgrounds flat.

## Typography
### Font Family
**Pretendard only.** The uploaded family is the entire type system — do not substitute or add another face. Pretendard is a Korean-first sans that also covers Latin cleanly, so a single family carries both the Korean body copy and any English terms.

**Weight ceiling: Bold (700).** By brand preference the deck never uses ExtraBold (800) or Black (900) — even the biggest headline, hero, and stat figure stops at **Bold**. Heaviness on a slide comes from *size*, not from a heavier-than-Bold weight. In practice a title is Bold at a large size; the visual weight reads as strong without the type feeling blocky.

Roles map to these weights:

| Pretendard weight | Numeric | Primary role |
|---|---|---|
| Bold | 700 | The heaviest weight used — hero, all titles, section-divider titles, stat figures, prices, table/column headers, `Q` markers, emphasized inline |
| SemiBold | 600 | Eyebrows, taglines, callout labels, card/feature headings, strong body emphasis |
| Medium | 500 | Chapter tags, captions, footer, lead lines that need slight weight |
| Regular | 400 | Default body and lead copy |
| Light | 300 | Airy lead paragraphs on sparse slides (use sparingly) |
| ExtraLight / Thin | 200 / 100 | Reserve; avoid at body sizes (too fragile to read) |

ExtraBold and Black OTFs may exist in the font bundle, but do **not** assign them to any text role.

In generators, select Bold as fontFace `"Pretendard"` with `bold: true` (there is no family literally named "Pretendard Bold"); SemiBold/Medium/Light use their named families (`"Pretendard SemiBold"`, etc.).

### Hierarchy
Sizes are given in points (pt) for a 16:9 slide (13.33in × 7.5in canvas).

These sizes are measured from the reference introduction deck — match them, don't drift.

All weights are capped at Bold (see Font Family). These exact sizes and line-heights are measured from the shipping deck — match them.

| Token | Size (pt) | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{type.hero}` | 44 | Bold | 1.12 | -0.6pt | Cover hero headline (often 2 lines) |
| `{type.section-headline}` | 40 | Bold | 1.14 | -0.6pt | Full-bleed statement / overview headline |
| `{type.slide-title}` | 26 | Bold | 1.14 | -0.4pt | Standard content-slide headline (1–2 lines) |
| `{type.eyebrow}` | 12 | SemiBold | 1.0 | 0 | Accent label above the title (the slide's sub-topic) |
| `{type.chapter-tag}` | 12 | Medium | 1.0 | 0 | Muted top-right chapter marker, e.g. `04 이용 안내` |
| `{type.lead}` | 15 | Regular | 1.0 | 0 | Muted-gray lead sentence under the title |
| `{type.column-head}` | 16 | SemiBold | 1.2 | -0.2pt | Column / feature / card headings |
| `{type.body-strong}` | 14 | SemiBold | 1.5 | 0 | Inline emphasis; FAQ questions |
| `{type.body}` | 13 | Regular | 1.5 | 0 | Default paragraph and card body |
| `{type.body-dense}` | 12 | Regular | 1.45 | 0 | Packed slides (FAQ, feature-options, admin) |
| `{type.caption}` | 11 | Medium | 1.35 | 0 | Captions, table sub-labels, chip text |
| `{type.stat-figure}` | 24–40 | Bold | 1.0 | -0.5pt | Big proof metrics and prices (e.g. `20만명~`, `100만원~`) |
| `{type.list-number}` | 14 | Bold | 1.0 | 0 | Inline `01`/`02` list/feature markers, accent color |
| `{type.footer}` | 9.5 | Medium | 1.0 | +0.5pt | Running footer (brand name, uppercase) + page number |

Reference rhythm: the title starts at y≈0.98in. Keep a **consistent, comfortable gap between the title and the lead whether the title is one or two lines** — a one-line title's lead sits at y≈1.6in, a two-line title's lead at y≈2.12in (both leave the same visual breathing room; do not let the lead crowd a two-line title). Card content begins ~2.85in from the top. The card heading (16pt) uses 1.2 line height, the card body (13pt) uses 1.5.

### Principles
- **Negative letter-spacing at display sizes.** Headlines at 20pt and up carry a slight tracking tighten (−0.2 → −0.6pt) for a modern, confident cadence. Never tighten body text at 14pt and below.
- **Bold is the ceiling; size carries emphasis.** The weight ladder is 400 (body) / 500 (lead, caption, footer) / 600 (eyebrow, card heading, emphasis) / 700 (hero, titles, stats). There is no 800/900 — a headline reads as strong because it is *large and Bold*, not because it is heavier than Bold. Pick a rung and hold it; don't drift between adjacent weights on one slide.
- **Title size, not weight, is the change.** Content-slide titles are **Bold 26pt** at 1.14 line height — deliberately smaller and lighter than a typical hero. This keeps the header calm so the content leads. Do not push titles back up to 30pt+ or to a heavier weight.
- **Body leading is comfortable at 1.5.** Card and paragraph body runs at 1.5; card headings at 1.2. On a genuinely packed slide (FAQ, feature-options) step to `{type.body-dense}` at 1.45. Density comes from more items in the calm frame, not from tighter lines.

## Layout
### Canvas
- **Slide size:** 16:9, 13.33in × 7.5in (960pt × 540pt; 1280px × 720px at 96dpi).
- **Outer margin (safe zone):** **0.85in** on left/right, ~0.6in top/bottom — matching the reference deck's generous frame. This margin is **constant** — density is gained inside it, never by eating into it.
- **Header band:** the top ~1.7in of a content slide is the title zone, in a fixed rhythm: eyebrow at y≈0.62in (left, accent) with the chapter tag at the same baseline (right, muted) → title at y≈0.94in → muted lead at y≈1.62in. Content begins around y≈2.6in, leaving a deliberate band of air below the lead.
- **Footer band:** every content slide carries a running footer at y≈7.0in — brand name uppercase (`{type.footer}`, muted) bottom-left, page number bottom-right. The cover and full-bleed section dividers omit it.

### Spacing System
- **Base unit:** 8pt. Sub-base values (2, 4, 6) for tight typographic adjustments; structural layout snaps to 8/12/16/24.
- **Tokens:** `{space.xxs}` 4pt · `{space.xs}` 8pt · `{space.sm}` 12pt · `{space.md}` 16pt · `{space.lg}` 24pt · `{space.xl}` 32pt · `{space.section}` 48pt.
- **Card padding:** `{space.lg}` (24pt) inside utility/feature cards; `{space.md}` (16pt) inside dense FAQ cells.
- **Column gutter:** 20–24pt between columns in a grid.
- **Inter-block spacing:** at least `{space.md}` (16pt) between a title and its body, and between stacked content blocks.

### Grid
- **Content width:** full width inside the outer margin (~11.9in usable).
- **Column patterns:** two-column contrast (problem/solution), three-column grids (differentiators, use cases, pricing), and single-column stacks (cover, agenda). Dense slides lean on 2–3 columns to organize volume.
- **Alignment:** left-align body and headers on content slides; center only on the cover, section dividers, and footer.

### Whitespace Philosophy
The outer margin and the calm surface are the deck's pedestal — they are what let dense content read as organized. Keep the frame quiet and the outer air constant, then work the interior. Cover, dividers, and footer get extra air; working slides fill their columns.

## Elevation & Depth
| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Slide backgrounds, section dividers, body text blocks |
| Soft hairline | 1px `{colors.hairline}` border | Utility/feature cards, pricing cells, table grid |
| Product shadow | `rgba(0,0,0,0.22)` blur 30, offset (3,5) | Product/UI renders resting on a surface — the only true shadow in the system |

**Shadow philosophy.** Use **essentially one** drop-shadow, and only on product/UI imagery — never on cards, text, or shapes. Elevation in the layout comes from (a) surface-color change (light slide ↔ dark slide) and (b) the hairline border on cards. The single shadow exists to give a screenshot or render visual weight, not to build UI hierarchy.

## Shapes
### Border Radius Scale
| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0pt | Full-bleed slide backgrounds; section dividers |
| `{rounded.sm}` | 8pt | Utility chips, inline mockup image corners |
| `{rounded.md}` | 12pt | Standard feature / content cards |
| `{rounded.lg}` | 18pt | Larger cards, pricing-plan panels |
| `{rounded.pill}` | fully round | Primary accent CTA, section-number badges, tags — the signature "action" shape |

### Imagery Geometry
- **Product/UI mockups** rest on a surface and pick up the single product shadow; corners at `{rounded.sm}` or `{rounded.md}`.
- **Full-bleed hero/divider imagery** is rectangular, edge-to-edge, no rounding.
- **Do not mix radii grammars** on one slide — pick `sm` for chips, `md`/`lg` for cards, `pill` for actions, nothing in between.

## Components
Recast for slides (the source's web nav/forms/responsive components are intentionally dropped).

### Cover / Hero Slide (`cover`)
Centered stack on white or parchment: the accent section index (`01`) small at top, product/company name in `{type.subtitle}`, the benefit headline in `{type.hero}` (ExtraBold/Black, tight tracking), a one-line tagline in `{type.lead}`, and URL/contact in `{type.caption}` at the base. Deliberately sparse — the one empty slide.

### Section Divider (`section-divider`)
Full-bleed `{colors.surface-tile-1}` (near-black), centered. Oversized accent number, then the section title in `{type.section-divider}` (white). No body. The color flip from the previous light slide is the transition.

### Slide Header (`slide-header`)
The deck's connective tissue, identical on every content slide. Top-left: an **eyebrow** (`{type.eyebrow}`, accent) naming the slide's sub-topic (e.g. `핵심 기능`, `적립 방식`). Top-right, same baseline: a **chapter tag** (`{type.chapter-tag}`, muted) with the chapter number + name (e.g. `04 이용 안내`). Below: the **title** (`{type.slide-title}`, ink, 1–2 lines), then a muted **lead** sentence (`{type.lead}`). No accent underline beneath the title — the eyebrow already carries the accent.

### Running Footer (`running-footer`)
Bottom of every content slide: brand mark uppercase (`{type.footer}`, muted) bottom-left — e.g. `CDBD · HOME.CDBD.IN` — and the page number (`{type.footer}`, muted) bottom-right. Omitted on the cover and full-bleed dividers.

### Metric / Proof Callout (`metric-callout`)
A row of 2–4 big figures in `{type.stat-figure}` (accent color) each over a `{type.caption}` label. Used on the overview slide for social proof. Sparse and confident.

### Two-Column Contrast (`contrast-2col`)
Problem | Solution. Two equal columns, each with a `{type.column-head}` header and a parallel list of `{type.body}` lines. Optionally tint the solution column parchment. Alignment across rows lets the reader pair items.

### Three-Column Grid (`grid-3col`)
Differentiators, use cases, or plan tiers. Three cards at `{rounded.md}` with `{colors.hairline}` border, `{space.lg}` padding, each: `{type.column-head}` header + dense `{type.body}` explanation. The default packing pattern for the deck's middle.

### Feature Slide (`feature`)
Numbered deep-dive. Left: heading in `{type.slide-title}` + dense `{type.body}` explanation (this is where density matters most). Right: a UI mockup/screenshot on a surface with the product shadow. Alternate the image side across consecutive feature slides for rhythm.

### Pricing Table (`pricing`)
Two or three plan panels at `{rounded.lg}`. Panel header: plan name in `{type.column-head}` + price in `{type.stat-figure}` (smaller variant). Feature rows in `{type.body}` separated by `{colors.hairline}`. Highlight the recommended plan with an accent top border or accent header. Note volume discount / free tier in `{type.caption}`.

### Timeline / Process (`timeline`)
A horizontal row of numbered stages connected by a thin accent line. Each stage: accent number, `{type.body-strong}` label, `{type.caption}` duration. Left-to-right progression.

### FAQ (`faq`)
The densest component. Two columns of Q&A pairs: question in `{type.body-strong}`, answer in `{type.body-dense}` (`{colors.ink-muted-80}`). Pack 6–12 pairs; use the full interior. Separate pairs with `{space.md}`.

### Footer / CTA (`footer`)
Quiet close on parchment or near-black: company name, contact, URL, and any legal in `{type.fine-print}` (`{colors.ink-muted-48}`). Optionally a single accent pill CTA. Returns the deck to the calm of the cover.

### Pill CTA (`cta-pill`)
Background `{colors.primary}` (accent), text white, fully rounded, padding ~11pt × 22pt, label in `{type.body-strong}`. The one action shape. On dark slides the accent still works; for a secondary action use a transparent pill with a 1px accent border and accent text.

## Iconography & Shapes
The deck's visual language is **simple icons and geometric shapes**, never photos, clipart, 3D, or busy illustration. This keeps the deck consistent with its minimal, single-accent system and renders identically everywhere.

- **Icon tile motif** (`icon-tile`): an accent-tint (`{colors.primary-tint}`) rounded square (~0.6in, `{rounded.md}`) holding one **monochrome brand-purple** icon — a line icon (Feather/Lucide-style) or a simple solid glyph. Sit it top-left of a card or beside a heading. Keep **one icon style across the whole deck** (same stroke weight, same corner feel). The `iconTile()` helper draws the tile; pass a `#6C4CFF` PNG (from react-icons) as `icon`, or omit it for the built-in abstract accent shape.
- **Shape diagrams:** build process/relationship/structure visuals from primitives — rounded rectangles, circles, thin hairlines, accent number badges, and small triangle/`▸` arrows. Timeline = number badges + connector line; comparison = two-column cards; flow = cards + arrows. No SmartArt-looking gradients.
- **Abstract UI mockups:** show product screens with the `phone()` helper (shape blocks + one accent pill), not screenshots. The single system drop-shadow lives only here.
- **Restraint:** one icon/shape motif per slide; flat forms; colors limited to purple / ink / gray / tint. Don't multiply icons just to fill space — an abstract tile alone reads fine.

## Do's and Don'ts
### Do
- Build visuals from **simple icons + geometric shapes** — the accent-tint icon-tile motif, shape diagrams, and abstract `phone()` mockups. Keep one icon style deck-wide.
- Use the single **brand accent** for every emphasis — callout numbers, key figures, active section markers, links, pill CTAs — and nothing else. One accent is the rule.
- Keep working slides (features, usage, pricing, FAQ) **dense**: fill the columns, pack the rows, prefer a grid over spreading one idea across several slides.
- Hold the **outer margin constant** and gain density inside it — never by shrinking the safe zone.
- Set headlines in `{type.hero}` / `{type.slide-title}` with negative tracking (−0.4 → −0.5pt) for the tight, confident cadence.
- Run body at Pretendard **Regular 14pt / 1.45**; step to `{type.body-dense}` (12.5pt) on genuinely packed slides rather than crushing leading.
- Alternate light/parchment and near-black slides for section rhythm — the color change is the divider.
- Reserve the single product-shadow (`rgba(0,0,0,0.22)` blur 30) for product/UI imagery only.
- Keep section dividers full-bleed near-black; keep the cover and footer sparse.
- Number sections (`01`, `02`, …) in the accent color to signal progression.

### Don't
- Don't use photos, clipart, 3D/glossy icons, gradients, emoji, or multicolor icons — icons are flat, monochrome brand purple, one style. Don't add icons just to fill space.
- Don't introduce a second accent color; every emphasis is the one brand accent.
- Don't add shadows to cards, text, or shapes — shadow is only for imagery.
- Don't use gradient fills as decoration; depth comes from surface change and real imagery.
- Don't substitute or add a font — **Pretendard only**, across Korean and Latin.
- Don't gain density by eating the outer margin or dropping body leading below 1.4 — add a column or move to `{type.body-dense}` instead.
- Don't drop body below the minimum readable size (`{type.body-dense}` 12.5pt) — dense means more content, not smaller-than-legible type.
- Don't make the cover or a section divider dense — their job is the contrast that makes working slides land.
- Don't mix radius grammars on one slide (`sm` chips / `md`–`lg` cards / `pill` actions).
- Don't use `{colors.primary-on-dark}` on light surfaces — it's the dark-slide accent variant only.

## Iteration Guide
1. Work ONE component at a time; reference its token key directly (`{component.feature}`, `{component.faq}`).
2. Use `{token.refs}` everywhere — never inline a raw hex or size that already has a token.
3. Titles stay Pretendard ExtraBold with negative tracking; body stays Pretendard Regular 14pt. The boundary is unbreakable.
4. The single drop-shadow is reserved for product/UI imagery only.
5. When a slide feels crowded, fix it with structure (add a column, align to a grid, move to `{type.body-dense}`) before removing content — this deck is meant to be dense.
6. When emphasis is needed, alternate surface (light → dark) before adding any chrome.

## Known Gaps / To Confirm
- **Logo** placement and lockup are not yet specified; add logo rules (cover, footer, size, clear space) once the logo asset is provided.
- Photographic/video treatment beyond product mockups is not specified; the system documented is the content-slide default.
