#!/bin/bash
# usage: commit.sh "<message>" <paths...>   (commits only those paths + author file, then pushes)
cd /Users/gustavo/Documents/prayer
msg="$1"; shift
git add -- "$@" content/authors/bellarmine.json
for i in 1 2 3 4 5; do git commit -q -m "$msg" -- "$@" content/authors/bellarmine.json && break; sleep 5; done
for i in 1 2 3; do git push -q origin HEAD:main 2>&1 | tail -1 && git diff --quiet origin/main HEAD 2>/dev/null; git fetch -q origin main; if git merge-base --is-ancestor HEAD origin/main; then break; fi; git pull -q --rebase origin main 2>&1 | tail -2; done
git log --oneline -1
