#!/usr/bin/env bash
set -euo pipefail

# Convert all PNGs to WebP in the given directory (or content/ by default),
# generating .webp alongside .png. A PNG is converted only when it is newer
# than its output, which is what lets CI reuse the images of an earlier run.

TARGET="${1:-$(cd "$(dirname "$0")/.." && pwd)/content}"

if ! command -v cwebp &> /dev/null; then
  echo "error: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

count=0
# content/do is the read-only Divinum Officium submodule: nothing of its site
# is published, so its images are left alone.
find "$TARGET" -name '*.png' -not -path '*/content/do/*' | while IFS= read -r f; do
  webp="${f%.png}.webp"
  if [ ! -f "$webp" ] || [ "$f" -nt "$webp" ]; then
    cwebp -q 85 "$f" -o "$webp" -quiet
  fi
  # A holy card also gets a small copy for gallery tiles and carousels, which
  # would otherwise download the full 1024px card to draw it 120pt wide.
  dir=$(dirname "$f")
  if [ "$(basename "$dir")" = saints ]; then
    thumb="$dir/thumbs/$(basename "${f%.png}").webp"
    if [ ! -f "$thumb" ] || [ "$f" -nt "$thumb" ]; then
      mkdir -p "$dir/thumbs"
      cwebp -q 80 -resize 384 0 "$f" -o "$thumb" -quiet
    fi
  fi
  count=$((count + 1))
done

echo "  $(find "$TARGET" -name '*.webp' | wc -l | tr -d ' ') WebP files up to date"

# The holy cards' sepia prints, which veil a card not yet received.
if [ -d "$TARGET/saints" ]; then
  if python3 -c 'import PIL' 2> /dev/null; then
    python3 "$(dirname "$0")/print-cards.py" "$TARGET/saints"
  else
    echo "warning: Pillow not found (pip install pillow): holy-card prints not made" >&2
  fi
fi
