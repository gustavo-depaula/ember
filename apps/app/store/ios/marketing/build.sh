#!/usr/bin/env bash
# Renders the captioned App Store screenshots and the product page header.
# Usage: marketing/build.sh   (from anywhere; needs Google Chrome)
set -euo pipefail
cd "$(dirname "$0")"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

shot() { # <url> <width> <height> <out.jpg>
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --virtual-time-budget=4000 \
    --window-size="$2,$3" --screenshot="$4.png" "$1" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 92 "$4.png" --out "$4" >/dev/null
  rm "$4.png"
}

enc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }

for locale in en-US pt-BR; do
  # The number in each name is its place in the order, so start clean.
  rm -rf "../$locale/screenshots-captioned"
  mkdir -p "../$locale/screenshots-captioned"
  n=0
  # Each line: screenshot (folder/name) | caption. Order is the store order.
  while IFS='|' read -r src caption; do
    n=$((n + 1))
    out="../$locale/screenshots-captioned/$(printf '%02d' $n)-$(basename "$src" | cut -d- -f2-).jpg"
    shot "file://$PWD/frame.html?c=$(enc "$caption")&s=$(enc "../$locale/$src.jpg")" 1320 2868 "$out"
    # App Store Connect's iPhone slot takes the 6.3" size, not the 6.9" the
    # simulator captures at. The two differ in shape by under a pixel.
    sips -z 2622 1206 "$out" >/dev/null
  done < "captions.$locale.txt"
done

mkdir -p ../header
shot "file://$PWD/header.html" 3840 1646 ../header/header.jpg
# App Store Connect's uploader turns the header away as .jpg; going through
# the JPEG leaves a PNG with no alpha channel, which the asset must not have.
sips -s format png ../header/header.jpg --out ../header/header.png >/dev/null
rm ../header/header.jpg

# Search results asset, 3:2. It carries a caption, so one per language.
search() { # <locale> <caption>
  mkdir -p "../$1/search"
  shot "file://$PWD/search.html?l=$1&c=$(enc "$2")" 3840 2560 "../$1/search/search.jpg"
  sips -s format png "../$1/search/search.jpg" --out "../$1/search/search.png" >/dev/null
  rm "../$1/search/search.jpg"
}
search en-US "Catholic prayer, day by day"
search pt-BR "Oração católica, dia após dia"
