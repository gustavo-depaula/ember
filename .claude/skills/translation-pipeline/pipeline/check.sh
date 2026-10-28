#!/bin/zsh
# One-screen state of the pool: processes, usage, and each run's state.
cd ${0:A:h}
date '+%a %H:%M'
print "committer: $(pgrep -f 'committer.sh' | wc -l | tr -d ' ')  pool: $(pgrep -f 'pool.sh' | wc -l | tr -d ' ')"
for r in runs/*(N/); do
  s=running
  [[ -f $r/DONE ]] && s="DONE $(<$r/DONE)"
  [[ -f $r/COMMITTED ]] && s=pushed
  [[ -f $r/NEEDS_REVIEW ]] && s="FLAGGED $(head -2 $r/NEEDS_REVIEW | tr '\n' ';')"
  print -r -- "${${r:t}#church-fathers__} | $s | $(tail -1 $r/status | cut -c1-60)"
done
tail -3 committer.log 2> /dev/null
CLAUDE_CONFIG_DIR=$HOME/.claude-work $HOME/.local/bin/claude -p /usage < /dev/null 2>&1 | grep -E '^Current (session|week \(all)'
