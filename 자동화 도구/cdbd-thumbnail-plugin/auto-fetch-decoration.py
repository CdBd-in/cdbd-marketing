#!/usr/bin/env python3
"""
Thiings 데코 자동 다운로드 + decorations.json 갱신
사용: python3 "자동화 도구/cdbd-thumbnail-plugin/auto-fetch-decoration.py" <slug>
예: python3 "자동화 도구/cdbd-thumbnail-plugin/auto-fetch-decoration.py" card

동작:
1. decorations.json 로드
2. slug가 이미 등록 + figma_hash 있음 → 그대로 출력 (재사용)
3. 없으면:
   a. thiings.co/things/{slug} HTML fetch
   b. PNG URL 정규식 추출 (vercel-storage)
   c. 블로그/썸네일/1. 디자인 가이드/1-3. 이미지/1-3-3. 이미지 자산/데코/{slug}.png 다운로드
   d. decorations.json에 등록 (tier=downloaded, figma_hash=null)
4. 출력: 다음 단계 안내 (Figma upload_assets MCP 호출)

Claude 워크플로우:
- 이 스크립트로 PNG 확보
- mcp__claude_ai_Figma__upload_assets로 figma_hash 받음
- update-hash 명령으로 decorations.json에 figma_hash 등록
"""
import json
import os
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# 프로젝트 루트 = 이 스크립트의 ../../
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
JSON_PATH = SCRIPT_DIR / "decorations.json"
DOWNLOAD_DIR = (
    PROJECT_ROOT / "블로그" / "썸네일" / "1. 디자인 가이드"
    / "1-3. 이미지" / "1-3-3. 이미지 자산" / "데코"
)
# vault 상대 경로 (decorations.json local_path 기록용)
LOCAL_PATH_PREFIX = "블로그/썸네일/1. 디자인 가이드/1-3. 이미지/1-3-3. 이미지 자산/데코"

THIINGS_BASE = "https://thiings.co/things"
PNG_URL_PATTERN = re.compile(
    r'https://lftz25oez4aqbxpq\.public\.blob\.vercel-storage\.com/image-[A-Za-z0-9\-_]+\.png'
)
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "  \
             "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def load_catalog():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_catalog(catalog):
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)


def fetch_thiings_page(slug):
    url = f"{THIINGS_BASE}/{slug}"
    req = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except HTTPError as e:
        raise RuntimeError(f"HTTP {e.code} from {url} (slug 잘못됐을 수도)")
    except URLError as e:
        raise RuntimeError(f"네트워크 오류: {e}")


def extract_png_url(html):
    matches = PNG_URL_PATTERN.findall(html)
    if not matches:
        raise RuntimeError("PNG URL 추출 실패 — Thiings 페이지 구조 변경 또는 슬러그 잘못됨")
    # 첫 번째 매칭 (보통 메인 이미지)
    return matches[0]


def download_png(url, dest_path):
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        data = resp.read()
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, "wb") as f:
        f.write(data)
    return len(data)


def update_hash_command(slug, figma_hash):
    """Figma 업로드 후 hash 등록 (Claude가 호출)"""
    catalog = load_catalog()
    if slug not in catalog["decorations"]:
        print(f"❌ '{slug}'가 카탈로그에 없음. 먼저 다운로드:", file=sys.stderr)
        print(f"   python3 {Path(__file__).name} {slug}", file=sys.stderr)
        sys.exit(1)
    catalog["decorations"][slug]["figma_hash"] = figma_hash
    catalog["decorations"][slug]["tier"] = "uploaded"
    # needed에서 제거
    if slug in catalog.get("needed", {}):
        del catalog["needed"][slug]
    save_catalog(catalog)
    print(f"✅ {slug} hash 등록: {figma_hash}")


def cmd_fetch(slug):
    catalog = load_catalog()
    decos = catalog["decorations"]

    # 이미 hash 있으면 재사용
    if slug in decos and decos[slug].get("figma_hash"):
        info = decos[slug]
        print(f"REUSE {slug}")
        print(f"  figma_hash: {info['figma_hash']}")
        print(f"  local: {info['local_path']}")
        print(f"  매칭: {info.get('match','')}")
        return

    # PNG 이미 있고 등록만 안 됨
    local_path = DOWNLOAD_DIR / f"{slug}.png"
    if slug in decos and decos[slug].get("tier") == "downloaded" and local_path.exists():
        print(f"DOWNLOADED (hash 미등록) {slug}")
        print(f"  local: {decos[slug]['local_path']}")
        print(f"  thiings_url: {decos[slug]['thiings_url']}")
        print(f"  → 다음: Figma upload_assets + update-hash {slug} <hash>")
        return

    # 새로 다운로드
    print(f"FETCH {slug} from Thiings...")
    html = fetch_thiings_page(slug)
    png_url = extract_png_url(html)
    print(f"  PNG URL: {png_url}")

    size = download_png(png_url, local_path)
    print(f"  ✅ saved: {local_path} ({size:,} bytes)")

    # 카탈로그 등록
    if slug not in decos:
        decos[slug] = {
            "thiings_url": png_url,
            "local_path": f"{LOCAL_PATH_PREFIX}/{slug}.png",
            "figma_hash": None,
            "figma_component_id": None,
            "tier": "downloaded",
            "match": catalog.get("needed", {}).get(slug, {}).get("match", "TBD"),
            "priority": catalog.get("needed", {}).get(slug, {}).get("priority", "⭐⭐"),
        }
    else:
        decos[slug]["thiings_url"] = png_url
        decos[slug]["tier"] = "downloaded"
    save_catalog(catalog)
    print(f"  📋 decorations.json 갱신")
    print(f"  → 다음: Figma upload_assets + python3 {Path(__file__).name} update-hash {slug} <hash>")


def cmd_list():
    catalog = load_catalog()
    print("=== UPLOADED (figma_hash 있음) ===")
    for slug, info in catalog["decorations"].items():
        if info.get("figma_hash"):
            print(f"  {slug:15s} {info['figma_hash'][:10]}... · {info.get('match','')}")
    print("\n=== DOWNLOADED (hash 미등록) ===")
    for slug, info in catalog["decorations"].items():
        if info.get("tier") == "downloaded" and not info.get("figma_hash"):
            print(f"  {slug:15s} {info['local_path']}")
    print("\n=== NEEDED (미다운로드) ===")
    for slug, info in catalog.get("needed", {}).items():
        if not isinstance(info, dict):  # _comment 등 메타 키 skip
            continue
        print(f"  {slug:15s} {info.get('priority','')} · {info.get('match','')}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "list":
        cmd_list()
    elif cmd == "update-hash":
        if len(sys.argv) < 4:
            print("사용: update-hash <slug> <hash>", file=sys.stderr); sys.exit(1)
        update_hash_command(sys.argv[2], sys.argv[3])
    else:
        # 인자 = slug
        cmd_fetch(cmd)


if __name__ == "__main__":
    main()
