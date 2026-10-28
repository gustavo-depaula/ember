#!/bin/zsh
# Heartbeat for the claude-work steps: every minute it reads /usage and, when
# the session reaches KILL_AT (default 90%) or the week WEEK_KILL_AT (97%),
# stops every translation step in flight. The session limit must never be
# exhausted, and a gate that is only checked before a step starts cannot
# guarantee that; this can, so the gate (SESSION_LIMIT) may sit much higher.
# A stopped step leaves HALT (the time of the stop); its driver sees it and
# runs the step again once the quota is back.
set -u
here=${0:A:h}
log() { print -r -- "$(date '+%a %H:%M:%S') $*" >> $here/watchdog.log; }
claudeWork() { CLAUDE_CONFIG_DIR=$HOME/.claude-work $HOME/.local/bin/claude "$@" < /dev/null; }

# The headless steps of this pipeline: an agent step is given the evidence
# directory; a single-shot call (run-book2.sh claudeCall) has no directory and
# is the only claude-work call that passes --no-session-persistence.
steps() {
  local pid
  for pid in $(pgrep -f "^$HOME/.local/bin/claude -p"); do
    ps -ww -o args= -p $pid | grep -qE 'ember-translation-evidence|--no-session-persistence' && print $pid
  done
}

unread=0
while true; do
  out=$(claudeWork -p /usage 2>&1)
  s=$(print -r -- $out | grep -m1 '^Current session:' | grep -oE '[0-9]+%' | tr -d %)
  w=$(print -r -- $out | grep -m1 '^Current week (all models):' | grep -oE '[0-9]+%' | tr -d %)
  if [[ -z $s || -z $w ]]; then
    # Three unreadable minutes in a row count as over the limit.
    (( ++unread >= 3 )) && s=100 w=100 || { sleep 60; continue }
  else
    unread=0
  fi
  if (( s >= ${KILL_AT:-90} || w >= ${WEEK_KILL_AT:-97} )); then
    pids=($(steps))
    if (( ${#pids} )); then
      date +%s > $here/HALT
      kill $pids
      log "session ${s}% week ${w}%: stopped ${#pids} step(s)"
    fi
  fi
  sleep 60
done
