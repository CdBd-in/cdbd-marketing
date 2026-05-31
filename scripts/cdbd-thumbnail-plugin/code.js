// CdBd 블로그 썸네일 자동 제작 Plugin
// vault: 1. 디자인 가이드 (5유형 시스템 + 슬롯 16종 + 베리에이션 워크플로우)

// 강조색 (1-1. 스타일)
const GREEN = { r: 77 / 255, g: 233 / 255, b: 139 / 255 };
const PURPLE = { r: 143 / 255, g: 128 / 255, b: 255 / 255 };

figma.showUI(__html__, { width: 500, height: 700 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-variants") {
    try {
      const result = await createVariants(msg.payload);
      figma.ui.postMessage({ type: "result", success: true, data: result });
      figma.notify(`✅ ${result.length}안 생성 완료`);
    } catch (err) {
      figma.ui.postMessage({ type: "result", success: false, error: err.message });
      figma.notify(`❌ 오류: ${err.message}`, { error: true });
    }
  }
};

/**
 * 4안 자동 제작 메인 함수
 * @param {Object} payload
 * @param {string} payload.title - 타이틀 (줄바꿈 \n 포함 가능)
 * @param {string} payload.subtitle - 서브타이틀 (없으면 빈 문자열)
 * @param {string} payload.emphasis - 강조어 (타이틀 안에 있는 문구)
 * @param {Array<{slotId: string, imageHash: string, name: string}>} payload.variants
 */
async function createVariants(payload) {
  const { title, subtitle, emphasis, variants } = payload;

  // 슬롯 페이지로 전환
  await figma.loadAllPagesAsync();
  let slotPage = figma.root.children.find(
    (p) => p.name === "🧩 썸네일 자동생성 템플릿 (슬롯)" || p.id === "1:1245"
  );
  if (!slotPage) slotPage = figma.currentPage;

  await figma.setCurrentPageAsync(slotPage);

  // 강조색: 서브 있으면 그린, 없으면 퍼플 (1-1 §2)
  const emphasisColor = subtitle ? GREEN : PURPLE;

  const results = [];
  let xCursor = -3500;
  const baseY = 4000;
  let yRow = 0;

  for (let i = 0; i < variants.length; i++) {
    const { slotId, imageHash, name } = variants[i];

    const original = await figma.getNodeByIdAsync(slotId);
    if (!original) {
      results.push({ name, error: `slot ${slotId} not found` });
      continue;
    }

    // 슬롯 clone
    const cloned = original.clone();
    cloned.name = name || `안${i + 1}_${slotId}`;
    cloned.x = xCursor + (i % 4) * 650;
    cloned.y = baseY + Math.floor(i / 4) * 500;
    slotPage.appendChild(cloned);

    // VISUAL_SLOT에 이미지 fill (CROP + 상단부터 — 의미 영역 크롭 §1.1.b)
    const visualSlot = cloned.findOne((n) => n.name === "VISUAL_SLOT");
    if (visualSlot && "fills" in visualSlot) {
      visualSlot.fills = [
        {
          type: "IMAGE",
          imageHash: imageHash,
          scaleMode: "CROP",
          // Y offset 0 = 상단부터. variants에 yOffset 명시 시 그 값 사용 (예: 0.3 = 30% 아래)
          imageTransform: [
            [1, 0, 0],
            [0, 1, variants[i].yOffset || 0],
          ],
        },
      ];
      // placeholder 외곽선 제거
      if ("strokes" in visualSlot) visualSlot.strokes = [];
    }

    // TITLE 텍스트 + 강조어 그린 — TITLE 못 찾으면 폴백 (옛 더미 이름)
    let titleNode = cloned.findOne(
      (n) => n.name === "TITLE" && n.type === "TEXT"
    );
    if (!titleNode) {
      // 폴백: TEXT_BLOCK 안의 두 번째 텍스트 (서브 다음 = 타이틀)
      const textBlock = cloned.findOne((n) => n.name === "TEXT_BLOCK");
      if (textBlock) {
        const texts = textBlock.children.filter((n) => n.type === "TEXT");
        titleNode = texts.length >= 2 ? texts[1] : texts[0];
      } else {
        // 폴백 2: 슬롯 직속 TEXT 중 가장 큰 것 = 타이틀
        const texts = cloned.children.filter((n) => n.type === "TEXT");
        titleNode = texts.sort((a, b) => b.height - a.height)[0];
      }
    }
    if (titleNode) {
      await figma.loadFontAsync(titleNode.fontName);
      titleNode.characters = title;

      // 강조어 색상 적용 (대소문자 그대로 매칭)
      if (emphasis) {
        const startIdx = title.indexOf(emphasis);
        if (startIdx !== -1) {
          titleNode.setRangeFills(startIdx, startIdx + emphasis.length, [
            { type: "SOLID", color: emphasisColor },
          ]);
        }
      }
    }

    // SUBTITLE 텍스트 (전체 그린) — 폴백 포함
    if (subtitle) {
      let subtitleNode = cloned.findOne(
        (n) => n.name === "SUBTITLE" && n.type === "TEXT"
      );
      if (!subtitleNode) {
        // 폴백: TEXT_BLOCK 안의 첫 번째 텍스트 = 서브타이틀
        const textBlock = cloned.findOne((n) => n.name === "TEXT_BLOCK");
        if (textBlock) {
          const texts = textBlock.children.filter((n) => n.type === "TEXT");
          if (texts.length >= 2) subtitleNode = texts[0]; // 첫 번째 = 서브
        }
      }
      if (subtitleNode) {
        await figma.loadFontAsync(subtitleNode.fontName);
        subtitleNode.characters = subtitle;
        subtitleNode.fills = [{ type: "SOLID", color: GREEN }];
      }
    }

    results.push({
      name: cloned.name,
      id: cloned.id,
      x: cloned.x,
      y: cloned.y,
    });
  }

  // 뷰포트 첫 안으로 이동
  if (results.length > 0 && !results[0].error) {
    const firstNode = await figma.getNodeByIdAsync(results[0].id);
    if (firstNode) figma.viewport.scrollAndZoomIntoView([firstNode]);
  }

  return results;
}
