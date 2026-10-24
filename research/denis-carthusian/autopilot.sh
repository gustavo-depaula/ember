#!/bin/sh
# Proofread the queue tier by tier from $1 (default 5), unattended, and push each finished tier to main.
#
#   systemd-run --user --unit denis-autopilot --working-directory="$PWD" --setenv=PATH="$PATH" ./autopilot.sh 5
#
# PATH must reach pnpm: the repository's pre-commit hook runs it, and a commit fails without it.
#
# proofread.py exits 75 at the session limit and 76 at the weekly cap (90%, leaving
# room for other work); either way this waits and runs it again, and it resumes
# where it stopped. Only the books and work files it rebuilt are committed.
cd "$(dirname "$0")" || exit 1
repo=$(git rev-parse --show-toplevel)
log="$HOME/ember-data/denis-carthusian/proofread.log"
say() { echo "$(date '+%Y-%m-%d %H:%M:%S') autopilot: $*" | tee -a "$log"; }

publish() {
  git -C "$repo" add content/books/denis-opera-omnia research/denis-carthusian/works
  git -C "$repo" diff --cached --quiet || git -C "$repo" commit -q -m "Denis the Carthusian: proofread tier $1 of the queue

The works of tier $1 in research/denis-carthusian/proofread.py, checked page by
page against the scans.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || return 1
  # Pushes whatever is ahead of main, a tier whose push failed before included.
  for wait in 2 4 8 16; do
    git -C "$repo" fetch -q origin main && git -C "$repo" rebase -q --autostash origin/main && git -C "$repo" push -q origin HEAD:main && return 0
    git -C "$repo" rebase --abort 2>/dev/null
    sleep "$wait"
  done
  return 1
}

tier=${1:-5}
last=$(.venv/bin/python -c "from proofread import tiers; print(len(tiers))")
while [ "$tier" -le "$last" ]; do
  .venv/bin/python proofread.py --tier "$tier" --weekly-cap 90 >> "$HOME/ember-data/denis-carthusian/proofread.out" 2>&1
  code=$?
  case $code in
    0)
      if publish "$tier"; then say "tier $tier pushed to main"; else say "tier $tier committed, push failed; will retry with the next tier"; fi
      tier=$((tier + 1)) ;;
    75) sleep 1800 ;;
    76) sleep 3600 ;;
    *) say "proofread.py exited $code; retrying in 30 min"; sleep 1800 ;;
  esac
done
say "queue finished"
notify-send "Denis proofreading" "Every tier is proofread and pushed." 2>/dev/null
