#!/bin/sh
# usage: commit_retry.sh "<message>" <paths...>   (retry on index.lock, then push)
msg="$1"; shift
for i in 1 2 3 4 5 6; do
  if git add -- "$@" 2>/dev/null && git commit -q -m "$msg" -- "$@" 2>/dev/null; then break; fi
  sleep $((i * 3))
done
for i in 1 2 3 4; do git push -q origin HEAD:main 2>/dev/null && break; git fetch -q origin; git rebase -q --autostash origin/main 2>/dev/null; sleep 2; done
git log --oneline -1 -- "$@"
