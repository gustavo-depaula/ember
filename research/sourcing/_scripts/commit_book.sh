#!/bin/sh
# usage: commit_book.sh "<message>" <paths...>   (commit only these paths, pull --rebase, push)
msg="$1"; shift
git add -- "$@" && git commit -q -m "$msg" -- "$@" 2>&1 | grep -v lint-staged
git pull -q --rebase --autostash origin main 2>&1 | tail -2
git push -q origin HEAD:main 2>&1 | tail -2
git log --oneline -1
