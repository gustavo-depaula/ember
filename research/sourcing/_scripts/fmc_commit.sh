#!/bin/sh
# usage: fmc_commit.sh "<message>" <paths...>  commit only named paths, push without touching the worktree
msg="$1"; shift
for i in 1 2 3 4 5 6; do
  if git add -- "$@" 2>/dev/null && git commit -q -m "$msg" -- "$@" 2>/dev/null; then break; fi
  sleep $((i * 3))
done
for i in 1 2 3 4; do git push -q origin HEAD:main 2>/dev/null && break; git fetch -q origin; git rebase -q origin/main 2>/dev/null || { echo "rebase blocked"; break; }; sleep 2; done
git log --oneline -1 -- "$@"
