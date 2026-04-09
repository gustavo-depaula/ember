#!/usr/bin/env bash
set -euo pipefail

# Convert all PNGs to WebP in the given directory (or content/ by default).
# Locally: generates .webp alongside .png so serve:content serves both.
# CI: called on the staged _site directory before deploy.

TARGET="${1:-$(cd "$(dirname "$0")/.." && pwd)/content}"

if ! command -v cwebp &> /dev/null; then
  echo "error: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

count=0
find "$TARGET" -name '*.png' | while IFS= read -r f; do
  cwebp -q 85 "$f" -o "${f%.png}.webp" -quiet
  count=$((count + 1))
done

echo "  Converted $(find "$TARGET" -name '*.webp' | wc -l | tr -d ' ') WebP files"
