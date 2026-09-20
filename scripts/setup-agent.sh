#!/usr/bin/env bash
# One-time setup for a fresh container (cloud agent, CI shell). Until these run,
# a red apps/app suite says nothing about the code. Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

# build-corpus.py imports snowballstemmer for the search index
python3 -m pip install --quiet snowballstemmer

# pnpm 10 skips dependency build scripts, so better-sqlite3 ships without its native addon
if [ ! -f node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then
  (cd node_modules/better-sqlite3 && npm run build-release)
fi

# app tests read the catalog from _site/; without it they fail with `catalog.json: 404`
pnpm build:corpus
