#!/bin/zsh
typeset -A URLS
URLS[seminar]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Fseminar%2Fviewer"
URLS[personalized]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Fpersonalized%2Fviewer"
URLS[rsvp]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Frsvp%2Fviewer"
URLS[reservation]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Freservation%2Fviewer"
URLS[buttery_moment]="https%3A%2F%2Fwww.cdbd.in%2Ftemplates%2Finvitation%2Fbuttery_moment%2Fviewer"
for name url in "${(@kv)URLS}"; do
  (
    api="https://api.microlink.io/?url=${url}&screenshot=true&meta=false&viewport.width=375&viewport.height=900&waitUntil=load&waitForTimeout=3000"
    resp=$(curl -sS "$api")
    shot=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('screenshot',{}).get('url',''))")
    if [ -n "$shot" ]; then
      curl -sf -o "masters-${name}.png" "$shot"
      echo "✅ masters-${name}.png $(stat -f%z masters-${name}.png) bytes"
    else
      echo "❌ ${name}: $(echo $resp | head -c 200)"
    fi
  ) &
done
wait
echo "--- done ---"
ls -la masters-*.png
