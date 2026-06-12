#!/bin/zsh
# Try multiple pages to find 상품 페이지
declare -A URLS
URLS[lookbook-p3]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Flookbook%2Fviewer%3Fpage%3D3"
URLS[lookbook-p4]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Flookbook%2Fviewer%3Fpage%3D4"
URLS[newarrival-p2]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Fnewarrival%2Fviewer%3Fpage%3D2"
URLS[newarrival-p3]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Fnewarrival%2Fviewer%3Fpage%3D3"
URLS[online_lookbook-p2]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Fonline_lookbook%2Fviewer%3Fpage%3D2"
URLS[online_lookbook-p3]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Fonline_lookbook%2Fviewer%3Fpage%3D3"
for k v in "${(@kv)URLS}"; do
  (
    api="https://api.microlink.io/?url=${v}&screenshot=true&meta=false&viewport.width=375&viewport.height=827&waitUntil=load&waitForTimeout=4000"
    resp=$(curl -sS "$api")
    shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
    [ -n "$shot" ] && curl -sf -o "${k}.png" "$shot" && echo "✅ ${k}.png $(stat -f%z ${k}.png)"
  ) &
done
wait
