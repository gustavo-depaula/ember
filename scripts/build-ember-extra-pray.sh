#!/usr/bin/env bash
# Vendor the gustavo-depaula/ember-extra Roman Missal corpus into base library.
#
# Usage: scripts/build-ember-extra-pray.sh [<commit-sha>]
# If no commit is given, uses the pinned commit below.
#
# Output: content/libraries/base/of/ (replaces previous contents)
#
# The mass-of DataSource reads from this directory via ctx.fetchAsset('base', 'of/...').
set -euo pipefail

PINNED_COMMIT="${1:-836fef70f768ff04046552c7f6eee30d0e1099be}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_OF_DIR="$REPO_ROOT/content/libraries/base/of"
SOURCE_REPO="https://github.com/gustavo-depaula/ember-extra.git"

STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT

echo "Cloning ember-extra at $PINNED_COMMIT..."
git clone --depth=1 "$SOURCE_REPO" "$STAGING_DIR/source" 2>&1 | tail -3
(cd "$STAGING_DIR/source" && git fetch --depth=1 origin "$PINNED_COMMIT" 2>/dev/null || true)
(cd "$STAGING_DIR/source" && git checkout "$PINNED_COMMIT" 2>&1 | tail -1)

# Replace the contents of base/of/ with ember-extra's data/ tree.
rm -rf "$BASE_OF_DIR"
mkdir -p "$BASE_OF_DIR"
cp -R "$STAGING_DIR/source/novus-ordo-missae/data/"* "$BASE_OF_DIR/"

# Record provenance so we can verify what's vendored.
cat > "$BASE_OF_DIR/_provenance.json" <<EOF
{
  "source": {
    "repo": "gustavo-depaula/ember-extra",
    "commit": "$PINNED_COMMIT"
  }
}
EOF

FILE_COUNT=$(find "$BASE_OF_DIR" -type f | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sk "$BASE_OF_DIR" | awk '{print $1 " KB"}')
echo "Vendored $FILE_COUNT files into base/of/ ($TOTAL_SIZE)"
