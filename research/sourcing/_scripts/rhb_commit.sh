#!/bin/sh
# usage: rhb_commit.sh <book-dir-under-content/books> "<Commit subject>" "<body>" [extra paths...]
cd /Users/gustavo/Documents/prayer || exit 1
d="$1"; subj="$2"; body="$3"; shift 3
python3 scripts/check-book.py "content/books/$d" >/dev/null || { echo "CHECK FAILED $d"; exit 1; }
for i in 1 2 3 4 5 6; do
  if git add -- "content/books/$d" "$@" 2>/dev/null && git commit -q -m "$subj

$body" -- "content/books/$d" "$@" 2>/dev/null; then break; fi
  sleep $((i * 3))
done
for i in 1 2 3 4; do git push -q origin HEAD:main 2>/dev/null && break; git fetch -q origin; git rebase -q --autostash origin/main 2>/dev/null; sleep 2; done
git log --oneline -1 -- "content/books/$d"
