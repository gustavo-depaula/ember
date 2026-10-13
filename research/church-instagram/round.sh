#!/bin/sh
# One search round done: store its rows, rebuild the CSV, commit, push, write the next batches.
# usage: round.sh <stage> <workflow run id> [next stage]
set -e
cd "$(dirname "$0")"
wf="$HOME/.claude/projects/-home-gustavo-Documents-ember--claude-worktrees-bridge-cse-014i171JzQwmWjHkZXd9UW69/1b0cc9c6-e2fd-5c82-96fe-f59e30867221/subagents/workflows"
python3 pipeline.py ingest "$1" "$wf/$2/journal.jsonl"
python3 pipeline.py merge "$1"
git add results "$1-instagram.csv" scrape.json 2>/dev/null || git add results "$1-instagram.csv"
git commit -qm "Research: church Instagram, $1 search round" && git push -q origin HEAD 2>&1 | tail -1
python3 pipeline.py next "${3:-$1}" 13
