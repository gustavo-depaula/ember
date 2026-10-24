#!/bin/zsh
# Keeps the weekend run alive without the orchestrator: every 2 minutes,
# restarts watchdog.sh, committer.sh or pool.sh if one died, and a driver
# whose book is claimed but unfinished with no process left. Exits at
# DEADLINE; the drivers stop themselves there too.
# usage: POOLS="claude:3 codex:2" DEADLINE="YYYY-MM-DD HH:MM" SESSION_LIMIT=… WEEK_LIMIT=… CODEX_LIMIT=… MAX_ROUNDS=… heartbeat.sh
set -u
# Patterns are anchored to the processes' own command lines: a shell that only
# mentions a script's name (a grep, a wait loop) must not count as it.
here=${0:A:h}
cd $here
log() { print -r -- "$(date '+%a %H:%M:%S') $*" >> $here/heartbeat.log; }
end=$(date -j -f '%Y-%m-%d %H:%M' "$DEADLINE" +%s)
started=$(date +%s)
log "started; deadline $DEADLINE"
while (( $(date +%s) < end )); do
  pgrep -f "^/bin/zsh \./watchdog\.sh" > /dev/null || { (nohup ./watchdog.sh >> watchdog.out 2>&1 &); log "restarted watchdog.sh"; }
  pgrep -f "^/bin/zsh \./committer\.sh" > /dev/null || { (nohup ./committer.sh >> committer.log 2>&1 &); log "restarted committer.sh"; }
  # A pool that drained the queue exits on purpose and leaves POOL_DONE.
  # POOLS lists engine:slots; a Codex pool translates with Codex.
  for p in ${=POOLS:-claude:3}; do
    e=${p%%:*} n=${p##*:}
    if ! pgrep -f "^/bin/zsh \./pool\.sh $e" > /dev/null && { [[ ! -f POOL_DONE.$e ]] || (( $(stat -f %m POOL_DONE.$e) < started )) }; then
      (nohup ./pool.sh $e $n >> pool.log 2>&1 &); log "restarted pool.sh $e $n"
    fi
  done
  for d in runs/*(N/); do
    [[ -f $d/DONE || ! -f $d/engine ]] && continue
    book=${${d:t}//__//}
    # Freshly claimed: the pool is about to start its driver.
    (( $(date +%s) - $(stat -f %m $d) < 300 )) && continue
    pgrep -f "^/bin/zsh .*/run-book2\.sh $book\$" > /dev/null && continue
    (nohup ./run-book2.sh $book >> $d/driver.err 2>&1 &)
    log "restarted the driver of $book"
  done
  sleep 120
done
log "deadline reached; exiting"
