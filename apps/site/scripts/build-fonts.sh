#!/usr/bin/env bash
# Subsets the app's typefaces (the same TTFs the Expo app bundles) to Latin
# woff2 for the web. Run after a font change; the output in src/fonts/ is
# committed so a site build needs no Python.
#   pip install fonttools brotli   (PYFTSUBSET=path/to/pyftsubset to override)
set -euo pipefail
root="$(cd "$(dirname "$0")/../../.." && pwd)"
out="$root/apps/site/src/fonts"
subset="${PYFTSUBSET:-pyftsubset}"
google="$root/node_modules/@expo-google-fonts"
local="$root/apps/app/assets/fonts"

# Latin + Latin Extended (accented Latin, Portuguese), punctuation, and the
# liturgical marks the pages set in type: ℣ ℟ ✠ ❧ † ‡. U+01FC-01FF carry the
# ǽ of accented liturgical Latin; the combining marks are for letters Unicode
# has no accented form of (œ́). A mark missing here is drawn from a fallback
# font, which can't anchor it to the letter and leaves it floating beside it.
ranges="U+0020-007E,U+00A0-017F,U+01FC-01FF,U+0218-021B,U+0300-030C,U+0327,U+0328,U+1E00-1EFF,U+2010-2027,U+2030-203A,U+20AC,U+2116,U+211F,U+2123,U+2190-2193,U+2720,U+271D,U+271E,U+2726,U+2727,U+2767,U+2619,U+2022,U+25CF,U+2713,U+00D7"
features="kern,liga,clig,calt,ccmp,locl,mark,mkmk,onum,lnum,tnum,pnum,smcp"

mkdir -p "$out"
anchored="$(mktemp --suffix=.ttf)"
trap 'rm -f "$anchored"' EXIT
make() {
  python3 "$root/apps/site/scripts/anchor-oe.py" "$1" "$anchored"
  "$subset" "$anchored" --unicodes="$ranges" --layout-features="$features" \
    --no-hinting --desubroutinize --flavor=woff2 --output-file="$out/$2.woff2" 2>&1 | grep -v FFTM || true
}

for f in Junicode-Light Junicode Junicode-Italic Junicode-Medium Junicode-MediumItalic Junicode-SemiBold UnifrakturMaguntia-Book; do
  make "$local/$f.ttf" "$f"
done
for w in 400Regular 400Regular_Italic 500Medium 600SemiBold 700Bold 700Bold_Italic; do
  make "$google/eb-garamond/$w/EBGaramond_$w.ttf" "EBGaramond-$w"
done
for w in 400Regular 600SemiBold 700Bold; do
  make "$google/cinzel/$w/Cinzel_$w.ttf" "Cinzel-$w"
done
ls -la "$out"
