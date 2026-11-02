#!/bin/bash
# usage: commit.sh "<message>" <paths...>   (commits only those paths + author file, then pushes)
cd /Users/gustavo/Documents/prayer
msg="$1"; shift
git add -- "$@" content/authors/bellarmine.json
for i in 1 2 3 4 5; do git commit -q -m "$msg" -- "$@" content/authors/bellarmine.json && break; sleep 5; done
git pull -q --rebase --autostash origin main 2>&1 | tail -3
git push -q origin HEAD:main 2>&1 | tail -2
git log --oneline -1
