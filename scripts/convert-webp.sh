#!/usr/bin/env bash
set -euo pipefail

# Convert all PNGs to WebP in the given directory (or content/ by default).
# Locally: generates .webp alongside .png so `pnpm hearth` serves both.
# CI: called on the staged _site_hearth copy before deploy.

TARGET="${1:-$(cd "$(dirname "$0")/.." && pwd)/content}"

if ! command -v cwebp &> /dev/null; then
  echo "error: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

count=0
find "$TARGET" -name '*.png' | while IFS= read -r f; do
  cwebp -q 85 "$f" -o "${f%.png}.webp" -quiet
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

echo "  Converted $(find "$TARGET" -name '*.webp' | wc -l | tr -d ' ') WebP files"
