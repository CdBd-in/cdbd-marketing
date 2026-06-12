#!/bin/zsh
typeset -A URLS
URLS[inha827]="https%3A%2F%2Fwww.cdbd.in%2FYuseok%2FInha_graduation_fashion_show"
URLS[masters827]="https%3A%2F%2Fwww.cdbd.in%2FMASTERS%2FMASTERS"
for name url in "${(@kv)URLS}"; do
  (
    api="https://api.microlink.io/?url=${url}&screenshot=true&meta=false&viewport.width=375&viewport.height=827&waitUntil=load&waitForTimeout=3000"
    resp=$(curl -sS "$api")
    shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
    if [ -n "$shot" ]; then
      curl -sf -o "${name}.png" "$shot"
      echo "✅ ${name}.png $(stat -f%z ${name}.png) bytes"
    else
      echo "❌ ${name}: $(echo $resp | head -c 200)"
    fi
  ) &
done
wait
