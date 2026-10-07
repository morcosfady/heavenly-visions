#!/bin/bash
# Screenshots the three home mockups (dark and light) and joins dark + light side by side. Needs the local server on 8001.
cd "$(dirname "$0")/../.."
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
mkdir -p qa-shots
for v in a b c; do
  for m in dark light; do
    Q=""; [ $m = light ] && Q="?light"
    "$CH" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$TEMP/ph0q$v$m" --window-size=500,960 --virtual-time-budget=8000 --screenshot="$PWD/qa-shots/p0-home-$v-$m.png" "http://localhost:8001/design/mockups/home-$v.html$Q" >/dev/null 2>&1
  done
done
python design/mockups/join.py
