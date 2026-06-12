#!/bin/zsh
typeset -A URLS
URLS[promotion]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fprofilelink%2Fpromotion%2Fviewer"
URLS[oak_table]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Foak_table%2Fviewer"
URLS[seminar]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Fseminar%2Fviewer"
URLS[portfolio]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fprofilelink%2Fportfolio%2Fviewer"
URLS[lookbook]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Fcatalog%2Flookbook%2Fviewer"
URLS[rsvp]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Frsvp%2Fviewer"
for name url in "${(@kv)URLS}"; do
  (
    api="https://api.microlink.io/?url=${url}&screenshot=true&meta=false&viewport.width=375&viewport.height=900&waitUntil=load&waitForTimeout=3000"
    resp=$(curl -sS "$api")
    shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
    if [ -n "$shot" ]; then
      curl -sf -o "${name}-hero.png" "$shot"
      echo "✅ ${name}-hero.png $(stat -f%z ${name}-hero.png) bytes"
    else
      echo "❌ ${name}: $(echo $resp | head -c 200)"
    fi
  ) &
done
wait
echo "--- done ---"
ls -la *-hero.png
