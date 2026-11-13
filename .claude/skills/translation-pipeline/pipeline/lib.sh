#!/bin/zsh
# Helpers shared by the drivers (run-book2.sh, terms-check.sh), sourced after
# they set here, run, base, partTag and evidence, which the helpers read when called.

log() { print -r -- "$(date '+%H:%M:%S') $partTag$*" >> $base/status; }

claudeWork() { CLAUDE_CONFIG_DIR=$HOME/.claude-work $HOME/.local/bin/claude "$@" < /dev/null; }

# Blocks until claude-work's current session is under SESSION_LIMIT (default 70%, low because a step in flight keeps spending and the session must never run out) and its week under
# WEEK_LIMIT (default 95%). An unreadable /usage counts as over the limit.
# Past DEADLINE ("YYYY-MM-DD HH:MM") it exits without a DONE marker, so the
# run can be resumed later from where it stopped.
checkDeadline() {
  if [[ -n ${DEADLINE:-} ]] && (( $(date +%s) >= $(date -j -f '%Y-%m-%d %H:%M' "$DEADLINE" +%s) )); then
    log "deadline $DEADLINE reached; stopping, progress kept"; exit 3
  fi
}

waitForQuota() {
  local out s w
  while true; do
    checkDeadline
    out=$(claudeWork -p /usage 2>&1)
    s=$(print -r -- $out | grep -m1 '^Current session:' | grep -oE '[0-9]+%' | tr -d %)
    w=$(print -r -- $out | grep -m1 '^Current week (all models):' | grep -oE '[0-9]+%' | tr -d %)
    if [[ -n $s && -n $w ]] && (( s < ${SESSION_LIMIT:-70} && w < ${WEEK_LIMIT:-95} )); then return; fi
    log "quota: session ${s:-?}% week ${w:-?}%, waiting"
    sleep 600
  done
}

# Codex's weekly usage (%), as its newest session file last reported it; empty when unknown.
codexUsed() {
  local f last=
  # The newest session that reported its rate limits (a session can end before it does).
  for f in $HOME/.codex/sessions/*/*/*/rollout-*.jsonl(Nom[1,8]); do
    last=$(grep -o '"primary":{"used_percent":[0-9.]*,"window_minutes":[0-9]*,"resets_at":[0-9]*' $f | tail -1)
    [[ -n $last ]] && break
  done
  # Nothing reported yet: assume room; a refused call falls back to Claude.
  [[ -n $last ]] || { print 0; return; }
  local used=${${last#*used_percent\":}%%[.,]*} resets=${last##*resets_at\":}
  # A reading from before its window reset is stale.
  (( resets <= $(date +%s) )) && used=0
  print $used
}
codexOk() { local u=$(codexUsed); [[ -z ${NO_CODEX:-} && -n $u ]] && (( u < ${CODEX_LIMIT:-99} )); }

R2() { python3.13 $here/r2.py "$@"; }
# A call made while the network is down fails at once, with no answer. That is
# not an unusable answer: counting it as one sent a book to the agent-session
# fallback, which deletes the translation so far. Wait and call again instead.
netDown() { grep -qsE "Can't reach the API server|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|error sending request" "$@"; }
waitForNetwork() {
  log "$1: network down; calling again once it is back"
  until curl -s -m 10 -o /dev/null https://api.anthropic.com; do checkDeadline; sleep 60; done
}

# Medium effort for both engines: high spent most of a translation's output on
# thinking (15.8M of 26.9M tokens over the Oct-Nov runs) for text the review
# rounds check anyway. GPT-6.1-Sol is within ~2 points of GPT-6-Astra at about
# a fifth of the price, so the Codex week stretches further.
effort=${EFFORT:-medium}
codexModel=${CODEX_MODEL:-gpt-6.1-sol}

# One tool-less claude-work call; the watchdog may stop it, and then it reruns
# after the reset. A single turn reads its input once, so caching it would only
# add the write premium.
claudeCall() { # system-prompt-file input output.json [effort]
  local started
  while true; do
    waitForQuota
    started=$(date +%s)
    DISABLE_PROMPT_CACHING=1 CLAUDE_CONFIG_DIR=$HOME/.claude-work $HOME/.local/bin/claude -p --tools "" --strict-mcp-config \
      --system-prompt "$(<$1)" --model opus --effort ${4:-$effort} --output-format json --no-session-persistence \
      < $2 > $3 2> ${3%.json}.log
    if [[ -f $here/HALT ]] && (( $(<$here/HALT) >= started )); then
      log "${3:t:r}: stopped by the watchdog near the session limit; rerunning after the reset"; continue
    fi
    netDown $3 ${3%.json}.log || break
    waitForNetwork ${3:t:r}
  done
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); open(sys.argv[2],'w').write(d.get('result') or '')" $3 ${3%.json}.last.md 2>> ${3%.json}.log
}

# One review call: the whole round in one message, no tools; prints the answer file.
reviewCall() { # name engine [system-prompt-file]
  local name=$1 eng=$2 sys=${3:-$here/review2.system.md}
  if [[ $eng == claude ]]; then
    claudeCall $sys $run/$name.prompt.md $run/$name.json
  else
    checkDeadline
    { cat $sys; print; print -- ---; print; cat $run/$name.prompt.md } > $run/$name.codex.md
    codex exec -s read-only --skip-git-repo-check -C $evidence -m $codexModel -c model_reasoning_effort=$effort -o $run/$name.last.md - \
      < $run/$name.codex.md > $run/$name.log 2>&1
  fi
}

field() { grep -oE "$2=[0-9]+" $1 | cut -d= -f2; }
