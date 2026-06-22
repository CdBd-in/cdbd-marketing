#!/bin/zsh
# A용 oak_table (827)
(
  api="https://api.microlink.io/?url=https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Foak_table%2Fviewer&screenshot=true&meta=false&viewport.width=375&viewport.height=827&waitUntil=load&waitForTimeout=3000"
  resp=$(curl -sS "$api")
  shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
  if [ -n "$shot" ]; then curl -sf -o "oak_table-827.png" "$shot"; echo "✅ oak_table-827.png $(stat -f%z oak_table-827.png)"; fi
) &
# C용 newarrival (900)
(
  api="https://api.microlink.io/?url=https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Fnewarrival%2Fviewer&screenshot=true&meta=false&viewport.width=375&viewport.height=900&waitUntil=load&waitForTimeout=3000"
  resp=$(curl -sS "$api")
  shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
  if [ -n "$shot" ]; then curl -sf -o "newarrival-900.png" "$shot"; echo "✅ newarrival-900.png $(stat -f%z newarrival-900.png)"; fi
) &
# C용 online_lookbook (900)
(
  api="https://api.microlink.io/?url=https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Fonline_lookbook%2Fviewer&screenshot=true&meta=false&viewport.width=375&viewport.height=900&waitUntil=load&waitForTimeout=3000"
  resp=$(curl -sS "$api")
  shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
  if [ -n "$shot" ]; then curl -sf -o "online_lookbook-900.png" "$shot"; echo "✅ online_lookbook-900.png $(stat -f%z online_lookbook-900.png)"; fi
) &
wait
