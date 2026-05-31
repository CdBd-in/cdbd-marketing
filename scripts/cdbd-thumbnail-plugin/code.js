// CdBd 블로그 썸네일 자동 제작 Plugin v4
// vault: 1. 디자인 가이드
// v4 변경: 공식 목업 컴포넌트 인스턴스 + TITLE/SUBTITLE 자동 줄바꿈 (width 300)

// 강조색 (1-1 §2)
const GREEN = { r: 77 / 255, g: 233 / 255, b: 139 / 255 };
const PURPLE = { r: 143 / 255, g: 128 / 255, b: 255 / 255 };

// 텍스트 자동 줄바꿈 임계 (1-1 §3.텍스트 작성 규칙)
const TEXT_MAX_WIDTH = 300;

// 공식 목업 컴포넌트 ID (1-3-1 §1.1.a)
const DEFAULT_MOCKUP_ID = "1:1368"; // 원페이지 목업-1

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

async function createVariants(payload) {
  const { title, subtitle, emphasis, variants } = payload;

  await figma.loadAllPagesAsync();
  let slotPage =
    figma.root.children.find((p) => p.id === "1:1245") ||
    figma.root.children.find((p) => p.name.includes("슬롯"));
  if (!slotPage) slotPage = figma.currentPage;
  await figma.setCurrentPageAsync(slotPage);

  const emphasisColor = subtitle ? GREEN : PURPLE;
  const results = [];
  const baseX = -3500;
  const baseY = 4000;

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const { slotId, imageHash, name } = v;
    const mockupId = v.mockupId || DEFAULT_MOCKUP_ID;

    const original = await figma.getNodeByIdAsync(slotId);
    if (!original) {
      results.push({ name, error: `slot ${slotId} not found` });
      continue;
    }

    const newName = name || `안${i + 1}_${slotId}`;

    // 동명 잔재 안 자동 삭제 (재실행 시 누적 방지)
    const existing = slotPage.children.filter((c) => c.name === newName);
    existing.forEach((c) => c.remove());

    const cloned = original.clone();
    cloned.name = newName;
    cloned.x = baseX + (i % 4) * 650;
    cloned.y = baseY + Math.floor(i / 4) * 500;
    // clipsContent 강제 — 베젤 위·아래 cut-off 블리드 ([[1-2-1]] §3 슬롯 스펙)
    if ("clipsContent" in cloned) cloned.clipsContent = true;
    slotPage.appendChild(cloned);

    // 1) VISUAL_SLOT 찾기
    const visualSlot = cloned.findOne((n) => n.name === "VISUAL_SLOT");
    if (visualSlot) {
      // 2) 공식 목업 컴포넌트 인스턴스 생성 + 내부 #FFFFFF rect에 fill
      const result = await applyMockup(cloned, visualSlot, mockupId, imageHash);
      if (!result.success) {
        // 폴백: 목업 못 찾으면 VISUAL_SLOT에 직접 fill
        if ("fills" in visualSlot) {
          visualSlot.fills = [
            { type: "IMAGE", imageHash: imageHash, scaleMode: "FILL" },
          ];
          if ("strokes" in visualSlot) visualSlot.strokes = [];
        }
      }
    }

    // 3) TITLE 텍스트 + 자동 줄바꿈 + 강조어
    await fillText(
      cloned,
      "TITLE",
      title,
      emphasis,
      emphasisColor,
      false
    );

    // 4) SUBTITLE 텍스트 (전체 그린) + 자동 줄바꿈
    if (subtitle) {
      await fillText(cloned, "SUBTITLE", subtitle, null, GREEN, true);
    }

    results.push({ name: cloned.name, id: cloned.id });
  }

  // 첫 안으로 뷰포트 이동
  if (results.length > 0 && !results[0].error) {
    const firstNode = await figma.getNodeByIdAsync(results[0].id);
    if (firstNode) figma.viewport.scrollAndZoomIntoView([firstNode]);
  }

  return results;
}

/**
 * 공식 목업 컴포넌트 인스턴스 생성 + VISUAL_SLOT 위치에 배치 + 내부 #FFFFFF rect에 imageHash fill
 */
async function applyMockup(parentSlot, visualSlot, mockupId, imageHash) {
  const mockupComponent = await figma.getNodeByIdAsync(mockupId);
  if (
    !mockupComponent ||
    (mockupComponent.type !== "COMPONENT" &&
      mockupComponent.type !== "COMPONENT_SET")
  ) {
    return { success: false, reason: "mockup component not found" };
  }

  // 인스턴스 생성
  const instance = mockupComponent.createInstance();

  // VISUAL_SLOT 크기에 맞춰 균일 스케일 (가로 기준)
  const scale = visualSlot.width / instance.width;
  instance.resize(instance.width * scale, instance.height * scale);

  // VISUAL_SLOT 위치에 배치 (가로 중앙, 세로 시작점)
  instance.x = visualSlot.x + (visualSlot.width - instance.width) / 2;
  instance.y = visualSlot.y;

  // 인스턴스 자체도 clipsContent (베젤 child들 cut-off 보장)
  if ("clipsContent" in instance) instance.clipsContent = true;

  parentSlot.appendChild(instance);

  // 내부 흰색/거의 흰색 rect 찾기 (#FFFFFF·#FAFAFA 등) — 1-3-1 §1.1.a
  // Vector 베젤은 VECTOR 타입이므로 RECTANGLE/FRAME만 허용
  const screen = instance.findOne((n) => {
    if (n.type !== "RECTANGLE" && n.type !== "FRAME") return false;
    if (!("fills" in n) || !Array.isArray(n.fills) || n.fills.length === 0)
      return false;
    const f = n.fills[0];
    if (f.type !== "SOLID") return false;
    // 회색 톤 (R/G/B 차이 ≤ 0.05) + 밝기 ≥ 0.9 (흰색/거의 흰색)
    const { r, g, b } = f.color;
    const isGrayTone =
      Math.abs(r - g) < 0.05 && Math.abs(g - b) < 0.05 && Math.abs(r - b) < 0.05;
    return isGrayTone && r >= 0.9 && g >= 0.9 && b >= 0.9;
  });

  if (screen) {
    screen.fills = [{ type: "IMAGE", imageHash: imageHash, scaleMode: "FILL" }];
  }

  // 빈 VISUAL_SLOT placeholder 제거
  visualSlot.remove();

  return { success: true, instanceId: instance.id, screenId: screen && screen.id };
}

/**
 * 텍스트 노드를 찾아 텍스트 채우기 + 자동 줄바꿈 (width 300)
 */
async function fillText(parent, nodeName, text, emphasis, color, isSubtitle) {
  // 1) 이름으로 찾기
  let node = parent.findOne((n) => n.name === nodeName && n.type === "TEXT");

  // 2) 폴백: TEXT_BLOCK 안에서 추정
  if (!node) {
    const textBlock = parent.findOne((n) => n.name === "TEXT_BLOCK");
    if (textBlock) {
      const texts = textBlock.children.filter((c) => c.type === "TEXT");
      if (isSubtitle) {
        // SUBTITLE은 TEXT_BLOCK 내 첫 번째
        node = texts.length >= 2 ? texts[0] : null;
      } else {
        // TITLE은 TEXT_BLOCK 내 두 번째 (서브 다음), 또는 단일
        node = texts.length >= 2 ? texts[1] : texts[0];
      }
    }
  }

  // 3) 폴백 2: 슬롯 직속 TEXT 중 큰 것 (TITLE)
  if (!node && !isSubtitle) {
    const texts = parent.children.filter((n) => n.type === "TEXT");
    node = texts.sort((a, b) => b.height - a.height)[0];
  }

  if (!node) return;

  await figma.loadFontAsync(node.fontName);

  // width 300 강제 + textAutoResize HEIGHT (자동 줄바꿈)
  node.textAutoResize = "HEIGHT";
  node.resize(TEXT_MAX_WIDTH, node.height);
  node.characters = text;

  // 전체 색상 적용 (서브타이틀)
  if (isSubtitle) {
    node.fills = [{ type: "SOLID", color: color }];
  }

  // 강조어 색상 적용 (타이틀)
  if (emphasis) {
    const idx = text.indexOf(emphasis);
    if (idx !== -1) {
      node.setRangeFills(idx, idx + emphasis.length, [
        { type: "SOLID", color: color },
      ]);
    }
  }
}
