/**
 * cdbd_deck.js — reusable helper library for building CDBD-brand decks with pptxgenjs.
 *
 * Encodes the CDBD design system (see ../references/design-system.md): brand purple #6C4CFF,
 * Pretendard only, weight ceiling = Bold, exact type sizes and line-heights measured from the
 * shipping deck, the eyebrow / chapter-tag / running-footer chassis, and the common slide types.
 *
 * Usage:
 *   const D = require('./cdbd_deck.js');
 *   const p = D.newPres();
 *   D.cover(p, { title: '씨디비디\n모바일 페이지 빌더', sub: '...', contact: 'home.cdbd.in · help@cdbd.in' });
 *   const s = D.content(p, { eyebrow:'핵심 기능', chapter:'01  왜 씨디비디인가',
 *                            title:'가장 쉽고 빠른\n모바일 페이지 제작 도구', lead:'...', page:'03' });
 *   D.threeCol(p, s, [ {label,title,body}, ... ]);   // draws cards on that slide
 *   await p.writeFile({ fileName: 'out.pptx' });
 *
 * All coordinates are inches on a 13.333 x 7.5 (16:9) canvas.
 * IMPORTANT: Bold = fontFace "Pretendard" + bold:true. Never assign ExtraBold/Black to text.
 */
const pptxgen = require("pptxgenjs");

// ---- Color tokens ----
const C = {
  ACCENT: "6C4CFF", ATINT: "EEEAFB", ON_DARK_ACCENT: "9B7DFF",
  INK: "1D1D1F", MUTED: "6E6E73", BODY: "55555A", FOOT: "9AA0A6",
  WHITE: "FFFFFF", PARCH: "F5F5F7", CARD: "F7F8FA", TILE: "272729",
  HAIR: "E5E7EB", WMUTE: "D9D2FF",
};
// ---- Font roles (Bold is the ceiling) ----
const F = { bold: "Pretendard", semi: "Pretendard SemiBold", med: "Pretendard Medium", reg: "Pretendard" };
// ---- Exact type + layout constants (measured from the shipping deck) ----
const T = {
  M: 0.85,                    // outer L/R margin
  HERO_SZ: 44, HERO_LS: 1.12,
  BIG_SZ: 40, BIG_LS: 1.14,   // full-bleed statement / overview headline
  TITLE_SZ: 26, TITLE_LS: 1.14,
  LEAD_SZ: 15,
  EYEBROW_SZ: 12, CHAPTER_SZ: 12,
  HEAD_SZ: 16, HEAD_LS: 1.2,
  BODY_SZ: 13, BODY_LS: 1.5,
  DENSE_SZ: 12, DENSE_LS: 1.45,
  FOOT_SZ: 9.5,
};
const RIGHT = 13.333 - T.M;

function newPres() {
  const p = new pptxgen();
  p.defineLayout({ name: "CDBD", width: 13.333, height: 7.5 });
  p.layout = "CDBD";
  return p;
}

// Running footer + page number (omit on cover / full-bleed dividers).
function footer(p, s, page, onDark) {
  const col = onDark ? "FFFFFF" : C.FOOT;
  s.addText("CDBD  ·  HOME.CDBD.IN", { x: T.M, y: 6.98, w: 6, h: 0.28, valign: "middle", fontFace: F.med, fontSize: T.FOOT_SZ, color: col, charSpacing: 0.5, margin: 0 });
  if (page != null) s.addText(String(page), { x: RIGHT - 1, y: 6.98, w: 1, h: 0.28, align: "right", valign: "middle", fontFace: F.med, fontSize: 10, color: col, margin: 0 });
}

// Standard content slide: eyebrow (accent) + chapter tag (muted) + Bold 26pt title + muted lead + footer.
// Returns the slide so callers can add body content below (content begins ~y:2.85).
function content(p, { eyebrow, chapter, title, lead, page }) {
  const s = p.addSlide();
  s.background = { color: C.WHITE };
  if (eyebrow) s.addText(eyebrow, { x: T.M, y: 0.62, w: 6, h: 0.28, valign: "bottom", fontFace: F.semi, fontSize: T.EYEBROW_SZ, color: C.ACCENT, margin: 0 });
  if (chapter) s.addText(chapter, { x: RIGHT - 5, y: 0.62, w: 5, h: 0.28, align: "right", valign: "bottom", fontFace: F.med, fontSize: T.CHAPTER_SZ, color: C.FOOT, margin: 0 });
  const two = /\n/.test(title || "");
  s.addText(title, { x: T.M, y: 0.98, w: 11, h: two ? 1.05 : 0.55, valign: "top", fontFace: F.bold, bold: true, fontSize: T.TITLE_SZ, color: C.INK, charSpacing: -0.4, lineSpacingMultiple: T.TITLE_LS, margin: 0 });
  // Consistent title→lead gap for 1- and 2-line titles.
  if (lead) s.addText(lead, { x: T.M, y: two ? 2.12 : 1.6, w: 11, h: 0.35, valign: "top", fontFace: F.reg, fontSize: T.LEAD_SZ, color: C.MUTED, margin: 0 });
  footer(p, s, page);
  return s;
}

// Cover slide: wordmark box + Bold hero + muted sub + contact line + phone mockups on a parchment panel.
function cover(p, { title, sub, contact, wordmark = "CDBD" }) {
  const s = p.addSlide();
  s.background = { color: C.WHITE };
  s.addShape(p.ShapeType.roundRect, { x: T.M, y: 0.72, w: 1.35, h: 0.5, fill: { type: "none" }, line: { color: C.INK, width: 1.25 }, rectRadius: 0.06 });
  s.addText(wordmark, { x: T.M, y: 0.72, w: 1.35, h: 0.5, align: "center", valign: "middle", fontFace: F.bold, bold: true, fontSize: 15, color: C.INK, charSpacing: 0.5, margin: 0 });
  s.addText(title, { x: T.M, y: 2.4, w: 6.6, h: 1.9, valign: "top", fontFace: F.bold, bold: true, fontSize: T.HERO_SZ, color: C.INK, charSpacing: -0.6, lineSpacingMultiple: T.HERO_LS, margin: 0 });
  if (sub) s.addText(sub, { x: T.M, y: 4.35, w: 6.4, h: 0.6, valign: "top", fontFace: F.reg, fontSize: 17, color: C.MUTED, lineSpacingMultiple: 1.4, margin: 0 });
  if (contact) s.addText(contact, { x: T.M, y: 6.7, w: 7, h: 0.3, valign: "middle", fontFace: F.med, fontSize: 11, color: C.FOOT, charSpacing: 0.3, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 7.4, y: 0.9, w: 5.1, h: 5.7, fill: { color: C.PARCH }, line: { type: "none" }, rectRadius: 0.16 });
  phone(p, s, 10.85, 4.0, 2.15, 4.15);
  phone(p, s, 9.15, 3.55, 2.15, 4.15);
  return s;
}

// Full-bleed accent statement slide with 2-4 proof metrics. metrics: [{fig, label}]
function sectionMetrics(p, { headline, sub, metrics = [], footerText = "CDBD · MOBILE PAGE BUILDER", page }) {
  const s = p.addSlide();
  s.background = { color: C.ACCENT };
  s.addText(headline, { x: T.M, y: 1.2, w: 9.5, h: 1.9, valign: "top", fontFace: F.bold, bold: true, fontSize: T.BIG_SZ, color: C.WHITE, charSpacing: -0.6, lineSpacingMultiple: T.BIG_LS, margin: 0 });
  if (sub) s.addText(sub, { x: T.M, y: 3.25, w: 9, h: 0.9, valign: "top", fontFace: F.reg, fontSize: 16, color: C.WMUTE, lineSpacingMultiple: 1.5, margin: 0 });
  s.addShape(p.ShapeType.line, { x: T.M, y: 4.8, w: RIGHT - T.M, h: 0, line: { color: "FFFFFF", width: 0.75, transparency: 70 } });
  const gap = 3.75;
  metrics.forEach((m, i) => {
    const x = T.M + i * gap;
    s.addText(m.fig, { x, y: 5.1, w: gap - 0.3, h: 0.7, valign: "top", fontFace: F.bold, bold: true, fontSize: 40, color: C.WHITE, charSpacing: -0.5, margin: 0 });
    s.addText(m.label, { x, y: 5.95, w: gap - 0.3, h: 0.35, valign: "top", fontFace: F.med, fontSize: 13, color: C.WMUTE, margin: 0 });
  });
  s.addText(footerText, { x: T.M, y: 6.98, w: 7, h: 0.28, valign: "middle", fontFace: F.med, fontSize: T.FOOT_SZ, color: "FFFFFF", charSpacing: 0.5, margin: 0 });
  if (page != null) s.addText(String(page), { x: RIGHT - 1, y: 6.98, w: 1, h: 0.28, align: "right", valign: "middle", fontFace: F.med, fontSize: 10, color: "FFFFFF", margin: 0 });
  return s;
}

// Phone mockup on a surface (abstract built-page preview). Call after placing a surface panel if desired.
function phone(p, s, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2;
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: C.TILE }, line: { type: "none" }, rectRadius: 0.26,
    shadow: { type: "outer", color: "000000", blur: 18, offset: 6, angle: 90, opacity: 0.22 } });
  const sx = x + 0.1, sy = y + 0.13, sw = w - 0.2, sh = h - 0.26;
  s.addShape(p.ShapeType.roundRect, { x: sx, y: sy, w: sw, h: sh, fill: { color: C.WHITE }, line: { type: "none" }, rectRadius: 0.16 });
  s.addShape(p.ShapeType.roundRect, { x: sx + 0.12, y: sy + 0.14, w: sw - 0.24, h: 0.7, fill: { color: C.ATINT }, line: { type: "none" }, rectRadius: 0.07 });
  s.addShape(p.ShapeType.roundRect, { x: sx + 0.12, y: sy + 1.0, w: sw * 0.5, h: 0.11, fill: { color: C.INK }, line: { type: "none" }, rectRadius: 0.04 });
  s.addShape(p.ShapeType.roundRect, { x: sx + 0.12, y: sy + 1.2, w: sw - 0.24, h: 0.5, fill: { color: C.CARD }, line: { color: C.HAIR, width: 0.5 }, rectRadius: 0.07 });
  s.addShape(p.ShapeType.roundRect, { x: sx + 0.12, y: sy + 1.78, w: sw - 0.24, h: 0.5, fill: { color: C.CARD }, line: { color: C.HAIR, width: 0.5 }, rectRadius: 0.07 });
  s.addShape(p.ShapeType.roundRect, { x: sx + 0.32, y: sy + 2.5, w: sw - 0.64, h: 0.34, fill: { color: C.ACCENT }, line: { type: "none" }, rectRadius: 0.17 });
}

// Simple icon tile — the deck's icon motif: an accent-tint rounded square housing a
// monochrome line/solid icon. Keep icons flat, single-color (brand purple), one style deck-wide.
//   opts.icon: a "image/png;base64,..." data URL (e.g. a react-icons glyph rendered at #6C4CFF).
//   No icon → an abstract accent shape is drawn, which reads cleanly on its own.
function iconTile(p, s, x, y, { size = 0.6, icon = null } = {}) {
  s.addShape(p.ShapeType.roundRect, { x, y, w: size, h: size, fill: { color: C.ATINT }, line: { type: "none" }, rectRadius: 0.12 });
  if (icon) {
    const inner = size * 0.55;
    s.addImage({ data: icon, x: x + (size - inner) / 2, y: y + (size - inner) / 2, w: inner, h: inner });
  } else {
    const inner = size * 0.4;
    s.addShape(p.ShapeType.roundRect, { x: x + (size - inner) / 2, y: y + (size - inner) / 2, w: inner, h: inner, fill: { color: C.ACCENT }, line: { type: "none" }, rectRadius: 0.08 });
  }
}

// Three-column card grid. cards: [{label, title, body, icon?}]  (label = accent eyebrow inside the card;
// icon = optional "image/png;base64,..." data URL placed in the tile)
function threeCol(p, s, cards, { y = 2.85, h = 3.5 } = {}) {
  const cw = (RIGHT - T.M - 2 * 0.35) / 3;
  cards.slice(0, 3).forEach((c, i) => {
    const x = T.M + i * (cw + 0.35);
    s.addShape(p.ShapeType.roundRect, { x, y, w: cw, h, fill: { color: C.WHITE }, line: { color: C.HAIR, width: 1 }, rectRadius: 0.14 });
    iconTile(p, s, x + 0.32, y + 0.3, { size: 0.6, icon: c.icon });
    if (c.label) s.addText(c.label, { x: x + 0.32, y: y + 1.1, w: cw - 0.64, h: 0.3, fontFace: F.semi, fontSize: 12, color: C.ACCENT, margin: 0 });
    s.addText(c.title, { x: x + 0.32, y: y + 1.4, w: cw - 0.64, h: 0.4, fontFace: F.semi, fontSize: T.HEAD_SZ, color: C.INK, charSpacing: -0.2, lineSpacingMultiple: T.HEAD_LS, margin: 0 });
    s.addText(c.body, { x: x + 0.32, y: y + 1.95, w: cw - 0.64, h: h - 2.1, fontFace: F.reg, fontSize: T.BODY_SZ, color: C.BODY, lineSpacingMultiple: T.BODY_LS, margin: 0 });
  });
}

// Pricing row. plans: [{note, name, features, price, highlight?}]  (highlight => accent panel)
function pricing(p, s, plans, { y = 2.75, h = 3.7 } = {}) {
  const cw = (RIGHT - T.M - 2 * 0.35) / 3;
  plans.slice(0, 3).forEach((pl, i) => {
    const x = T.M + i * (cw + 0.35), hl = !!pl.highlight;
    s.addShape(p.ShapeType.roundRect, { x, y, w: cw, h, fill: { color: hl ? C.ATINT : C.WHITE }, line: { color: hl ? C.ACCENT : C.HAIR, width: hl ? 1.5 : 1 }, rectRadius: 0.14 });
    s.addText(pl.note, { x: x + 0.34, y: y + 0.3, w: cw - 0.68, h: 0.3, fontFace: F.med, fontSize: 12, color: C.MUTED, margin: 0 });
    s.addText(pl.name, { x: x + 0.34, y: y + 0.67, w: cw - 0.68, h: 0.5, fontFace: F.bold, bold: true, fontSize: 22, color: C.ACCENT, charSpacing: -0.3, margin: 0 });
    s.addShape(p.ShapeType.line, { x: x + 0.34, y: y + 1.3, w: cw - 0.68, h: 0, line: { color: C.HAIR, width: 0.75 } });
    s.addText(pl.features, { x: x + 0.34, y: y + 1.47, w: cw - 0.68, h: 1.1, fontFace: F.reg, fontSize: 13, color: C.BODY, lineSpacingMultiple: 1.55, margin: 0 });
    s.addText("가격", { x: x + 0.34, y: y + 2.75, w: cw - 0.68, h: 0.25, fontFace: F.med, fontSize: 11, color: C.MUTED, margin: 0 });
    s.addText(pl.price, { x: x + 0.34, y: y + 2.97, w: cw - 0.68, h: 0.55, fontFace: F.bold, bold: true, fontSize: 24, color: C.INK, charSpacing: -0.4, margin: 0 });
  });
}

// Dense two-column FAQ. items: [{q, a}]
function faq(p, s, items, { y0 = 2.2, rowH = 1.45, cardH = 1.25 } = {}) {
  const colX = [T.M, 6.95], colW = 5.5;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = colX[col], y = y0 + row * rowH;
    s.addShape(p.ShapeType.roundRect, { x, y, w: colW, h: cardH, fill: { color: C.WHITE }, line: { color: C.HAIR, width: 1 }, rectRadius: 0.1 });
    s.addText("Q", { x: x + 0.28, y: y + 0.24, w: 0.35, h: 0.35, fontFace: F.bold, bold: true, fontSize: 14, color: C.ACCENT, margin: 0 });
    s.addText(it.q, { x: x + 0.68, y: y + 0.22, w: colW - 0.95, h: 0.35, fontFace: F.semi, fontSize: 14, color: C.INK, charSpacing: -0.2, margin: 0 });
    s.addText(it.a, { x: x + 0.68, y: y + 0.58, w: colW - 0.95, h: 0.55, fontFace: F.reg, fontSize: T.DENSE_SZ, color: C.BODY, lineSpacingMultiple: T.DENSE_LS, margin: 0 });
  });
}

module.exports = { pptxgen, newPres, C, F, T, RIGHT, content, cover, sectionMetrics, phone, iconTile, threeCol, pricing, faq, footer };
