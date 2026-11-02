#!/bin/bash
# usage: victorines_commit.sh <book dir> "<message>" [extra paths...]
cd /Users/gustavo/Documents/prayer
d="$1"; msg="$2"; shift 2
python3 scripts/check-book.py "$d" >/dev/null || { echo CHECK FAILED; exit 1; }
for i in 1 2 3 4 5; do
  git add -- "$d" "$@" 2>/dev/null && git commit -q -m "$msg" -- "$d" "$@" && break
  sleep 4
done
git log --oneline -1
for i in 1 2 3; do
  git pull -q --rebase --autostash origin main >/dev/null 2>&1
  git push -q origin HEAD:main 2>/dev/null && { echo pushed; break; }
  sleep 3
done
git status --short | grep -E "^(UU|AA)|rebase" ; ls .git/rebase-merge .git/rebase-apply 2>/dev/null | head -2
