#!/bin/sh
# usage: chesterton_ship.sh <slug> "<Title>" [wordcount-note]   check, commit own paths, push
cd /Users/gustavo/Documents/prayer || exit 1
slug="$1"; title="$2"; d="content/books/chesterton-opera-omnia/$slug"
python3 scripts/check-book.py "$d" >/tmp/x/chk-$slug.txt 2>&1 || { echo "CHECK FAILED $slug"; tail -5 /tmp/x/chk-$slug.txt; exit 1; }
sh research/sourcing/_scripts/commit_retry.sh "Import Chesterton's $title (en-US)

Source: Project Gutenberg or equivalent proofread e-text, tier A (see book.json sources)." "$d" >/dev/null
echo "$slug $(git log --oneline -1 -- "$d")"
