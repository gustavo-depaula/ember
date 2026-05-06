#!/usr/bin/env bash
# Ensure the ember-extra submodule is initialized and mirror its
# `novus-ordo-missae/data/` tree into `content/libraries/base/of/` so the
# .pray build pipeline can package it.
#
# Run this manually after `git clone` (or `pnpm install` triggers it via
# the `prepare` script). The destination directory is gitignored — only
# the submodule pointer in `.gitmodules` + the parent repo's submodule
# commit SHA are version-controlled.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUBMODULE_DIR="$REPO_ROOT/vendor/ember-extra"
SUBMODULE_DATA="$SUBMODULE_DIR/novus-ordo-missae/data"
DEST_DIR="$REPO_ROOT/content/libraries/base/of"

if [ ! -d "$SUBMODULE_DIR/.git" ] && [ ! -f "$SUBMODULE_DIR/.git" ]; then
  echo "ember-extra submodule not initialized; running git submodule update --init..."
  (cd "$REPO_ROOT" && git submodule update --init --depth=1 vendor/ember-extra)
fi

if [ ! -d "$SUBMODULE_DATA" ]; then
  echo "ERROR: $SUBMODULE_DATA not found after submodule init" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
# Use rsync if available (faster, handles deletes); fall back to cp.
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$SUBMODULE_DATA/" "$DEST_DIR/"
else
  rm -rf "$DEST_DIR"
  mkdir -p "$DEST_DIR"
  cp -R "$SUBMODULE_DATA/." "$DEST_DIR/"
fi

echo "ember-extra synced → $DEST_DIR"
