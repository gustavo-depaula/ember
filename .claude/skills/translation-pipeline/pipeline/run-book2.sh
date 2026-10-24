#!/bin/zsh
# The book driver: translate in single-shot calls over spans of the source
# (t2.py; an agent session only if a span fails twice), then single-shot
# review rounds (r2.py builds each round's message and applies the
# reviewer's patches; the reviewer has no tools).
#   round 1: full read by Claude Opus; round 2: full read by Codex;
#   later rounds: a delta read of the paragraphs the previous round changed,
#   by the other engine; a full read again whenever a delta read finds a
#   meaning-level defect, or a patch could not be applied.
# Stops when at least 3 rounds ran, two of them full reads, the last two found
# no meaning-level defect, and the last one changed nothing (minor fixes are
# applied and verified, but do not count against convergence).
# A book over PART_WORDS source words (default 40000) is reviewed in parts of
# chapters, each part to convergence on its own in runs/<book>/part-K/.
# A book too long for one run (the Summa) is taken one part at a time:
# `<book>#<scope>` translates and reviews the chapter files named <scope>-*
# (BOOK_SCOPE for t2.py/r2.py/audit.py), then its toc titles (titles.py).
# usage: run-book2.sh <book path relative to content/books>[#scope]
set -u

root=$(<${0:A:h}/ROOT)
here=${0:A:h}
spec=$1
book=${spec%%\#*} scope=
[[ $spec == *\#* ]] && scope=${spec#*\#}
[[ -n $scope ]] && export BOOK_SCOPE=$scope-
run=$here/runs/${spec//\//__}
minRounds=3
maxRounds=${MAX_ROUNDS:-10}
mkdir -p $run
base=$run partTag=
cd $root
engine=codex; [[ -f $run/engine ]] && engine=$(<$run/engine)

# claude-work refuses to write under .claude/, so its evidence lives outside the repo.
if [[ $engine == claude ]]; then
  evidence=$HOME/Documents/ember-translation-evidence/${spec//\//__}
else
  evidence=$run/evidence
fi
mkdir -p $evidence
evidenceBase=$evidence

log() { print -r -- "$(date '+%H:%M:%S') $partTag$*" >> $base/status; }


claudeTools=(Read Edit Write Glob Grep Skill
  'Bash(rg:*)' 'Bash(grep:*)' 'Bash(wc:*)' 'Bash(jq:*)' 'Bash(ls:*)' 'Bash(cat:*)'
  'Bash(head:*)' 'Bash(tail:*)' 'Bash(sed -n:*)' 'Bash(awk:*)' 'Bash(sort:*)' 'Bash(uniq:*)'
  'Bash(diff:*)' 'Bash(python3.13:*)' 'Bash(python3:*)' 'Bash(mkdir:*)'
  'Bash(git diff:*)' 'Bash(git status:*)' 'Bash(git log:*)' 'Bash(git show:*)')

# Keeps each step's fixed prefix small (it is re-read on every turn): no MCP
# servers, no plugins, and only the built-in tools a step uses.
plugins='"enabledPlugins":{"typescript-lsp@claude-plugins-official":false,"skill-creator@claude-plugins-official":false,"mattpocock-skills@claude-plugins-official":false}'
lean=(--strict-mcp-config --settings "{$plugins}")
# The same, with the 5-minute prompt cache: for steps whose turns are close together.
lean5m=(--strict-mcp-config --settings "{$plugins,\"promptCacheTtl\":\"5m\"}")
baseTools=(Read Edit Write Glob Grep Skill Bash)

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

runStep() { # name promptfile engine [claude model]
  checkDeadline
  if [[ $3 == claude ]]; then
    # Turns are seconds to a minute apart (measured: none of 3,391 translation
    # turn gaps passed 5 minutes), so the 5-minute cache is enough and its
    # writes cost 1.25x input instead of the 1-hour cache's 2x.
    local -x FORCE_PROMPT_CACHING_5M=1
    local m=(); [[ -n ${4:-} ]] && m=(--model $4 --effort medium)
    local flags=($lean5m)
    # watchdog.sh stops the steps in flight when the session nears its limit;
    # a step it stopped is run again once the quota is back.
    local started
    while true; do
      waitForQuota
      started=$(date +%s)
      claudeWork -p "$(<$2)" --permission-mode acceptEdits --add-dir $evidence \
        --allowedTools $claudeTools --disallowedTools Agent $flags --tools $baseTools $m \
        > $run/$1.last.md 2> $run/$1.log
      [[ -f $here/HALT ]] && (( $(<$here/HALT) >= started )) || break
      log "$1: stopped by the watchdog near the session limit; rerunning after the reset"
    done
  else
    codex exec -C $root -s workspace-write --add-dir $evidence -o $run/$1.last.md "$(<$2)" < /dev/null > $run/$1.log 2>&1
  fi
}

R2() { python3.13 $here/r2.py "$@"; }
print v2 > $run/pipeline

# One tool-less claude-work call; the watchdog may stop it, and then it reruns
# after the reset. A single turn reads its input once, so caching it would only
# add the write premium.
claudeCall() { # system-prompt-file input output.json [effort]
  local started
  while true; do
    waitForQuota
    started=$(date +%s)
    DISABLE_PROMPT_CACHING=1 CLAUDE_CONFIG_DIR=$HOME/.claude-work $HOME/.local/bin/claude -p --tools "" --strict-mcp-config \
      --system-prompt "$(<$1)" --model opus --effort ${4:-high} --output-format json --no-session-persistence \
      < $2 > $3 2> ${3%.json}.log
    [[ -f $here/HALT ]] && (( $(<$here/HALT) >= started )) || break
    log "${3:t:r}: stopped by the watchdog near the session limit; rerunning after the reset"
  done
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); open(sys.argv[2],'w').write(d.get('result') or '')" $3 ${3%.json}.last.md 2>> ${3%.json}.log
}

T2() { python3.13 $here/t2.py "$@"; }

# A generation call (translation, titles) by the run's engine. A Codex run
# translates with Codex: it then costs claude-work only its review rounds.
genCall() { # system-prompt-file input output.json
  if [[ $engine == codex ]]; then
    checkDeadline
    local out=${3%.json}
    { cat $1; print; print -- ---; print; cat $2 } > $out.codex.md
    codex exec -s read-only --skip-git-repo-check -C $evidence -c model_reasoning_effort=high -o $out.last.md - \
      < $out.codex.md > $out.log 2>&1
  else
    claudeCall "$@"
  fi
}

# Translation: single-shot calls over spans of the source (t2.py); if a span
# cannot be got right in two calls, the whole book falls back to one agent session.
if [[ ! -f $run/translate.ok ]]; then
  units=$(T2 units content/books/$book)
  fallback=
  for k in $(seq 1 $units); do
    [[ -f $run/translate-u$k.ok ]] && continue
    ok=
    for attempt in 1 2; do
      log "translate: call $k of $units (attempt $attempt)"
      T2 prompt content/books/$book $k $run/translate-u$k.prompt.md
      genCall $here/t2.system.md $run/translate-u$k.prompt.md $run/translate-u$k.json
      if T2 write content/books/$book $k $run/translate-u$k.last.md > $run/translate-u$k.problems 2>&1; then ok=1; break; fi
      log "translate: call $k unusable: $(head -c 300 $run/translate-u$k.problems | tr '\n' ' ')"
    done
    [[ -n $ok ]] || { fallback=1; break; }
    touch $run/translate-u$k.ok
  done
  if [[ -n $fallback ]] || ! T2 check content/books/$book > $run/translate.problems 2>&1; then
    # An agent session would translate the whole book, not this part.
    [[ -n $scope ]] && { log "translate: FAILED (part $scope)"; print FAILED > $run/DONE; exit 1; }
    log "translate: falling back to an agent session"
    rm -rf content/books/$book/pt-BR $run/translate-u*.ok; git checkout -q -- content/books/$book/book.json
    sed "s|__BOOK__|$book|g" $here/translate.prompt.md > $run/translate.prompt.md
    if ! runStep translate $run/translate.prompt.md claude || ! ls content/books/$book/pt-BR/*.md > /dev/null 2>&1; then
      log "translate: FAILED"; print FAILED > $run/DONE; exit 1
    fi
  fi
  touch $run/translate.ok
  log "translate: done"
fi

# A part's toc titles, from the translated text (t2 calls never see the toc).
if [[ -n $scope && ! -f $run/titles.ok ]]; then
  ok=
  for attempt in 1 2; do
    log "titles: start (attempt $attempt)"
    python3.13 $here/titles.py prompt content/books/$book $scope $run/titles.prompt.md
    genCall $here/titles.system.md $run/titles.prompt.md $run/titles.json
    python3.13 $here/titles.py write content/books/$book $scope $run/titles.last.md > $run/titles.problems 2>&1 && { ok=1; break; }
    log "titles: unusable: $(head -c 200 $run/titles.problems)"
  done
  [[ -n $ok ]] || { log "titles: FAILED"; print FAILED > $run/DONE; exit 1; }
  touch $run/titles.ok
  log "titles: $(<$run/titles.problems)"
fi

# One review call: the whole round in one message, no tools; prints the answer file.
reviewCall() { # name engine
  local name=$1 eng=$2
  if [[ $eng == claude ]]; then
    claudeCall $here/review2.system.md $run/$name.prompt.md $run/$name.json
  else
    checkDeadline
    { cat $here/review2.system.md; print; print -- ---; print; cat $run/$name.prompt.md } > $run/$name.codex.md
    codex exec -s read-only --skip-git-repo-check -C $evidence -c model_reasoning_effort=high -o $run/$name.last.md - \
      < $run/$name.codex.md > $run/$name.log 2>&1
  fi
}

field() { grep -oE "$2=[0-9]+" $1 | cut -d= -f2; }

# The review rounds of the book, or of the part in $run (R2_ONLY); writes
# $run/DONE and returns 0 when converged.
reviewLoop() {
while true; do
  n=$(ls $run | grep -c '^review-[0-9]*\.result$')
  if (( n >= 3 )); then
    last=$run/review-$n.result prev=$run/review-$((n-1)).result
    fulls=$(cat $run/review-*.mode | grep -c '^full$')
    codexFull=$(for (( i = 1; i <= n; i++ )); do [[ $(<$run/review-$i.mode) == full && $(<$run/review-$i.engine) == codex ]] && print x; done | wc -l)
    if (( codexFull == 0 )) && codexOk; then
      : # one full read by Codex is still owed
    elif (( fulls >= 2 && $(field $last meaning) == 0 && $(field $prev meaning) == 0 && $(field $last applied) == 0 )); then
      log "finished: $n rounds ($fulls full reads), last two without meaning-level defects, last one changed nothing"
      print OK > $run/DONE; return 0
    fi
  fi
  if (( n >= maxRounds )); then
    log "finished: hit $maxRounds rounds without converging"; print MAXED > $run/DONE; return 1
  fi
  r=$((n + 1)) name=review-$r
  # Mode and engine for this round.
  mode=delta
  if (( r <= 2 )); then
    mode=full
  else
    p=$run/review-$n.result
    [[ $(<$run/review-$n.mode) != full && $(field $p meaning) -gt 0 ]] && mode=full
    # A meaning-level fix that could not be applied is a defect still in the text.
    (( $(jq '[.failed[] | select(.fix.class == "meaning")] | length' $run/changes-$n.json) > 0 )) && mode=full
    (( r == 3 && $(field $p meaning) >= 3 )) && mode=full
  fi
  # A book gets one full read from each engine; Codex's comes second.
  codexFull=$(for (( i = 1; i <= n; i++ )); do [[ $(<$run/review-$i.mode) == full && $(<$run/review-$i.engine) == codex ]] && print x; done | wc -l)
  if (( r >= 2 && codexFull == 0 )) && codexOk; then mode=full; fi
  if (( r == 1 )); then eng=claude
  elif (( codexFull == 0 )) && codexOk; then eng=codex
  elif [[ $(<$run/review-$n.engine) == claude ]] && codexOk; then eng=codex
  else eng=claude; fi
  if [[ $mode == delta ]] && [[ $(jq '.changed | length' $run/changes-$n.json) == 0 ]]; then
    # Nothing changed since the last read: nothing to verify, no call.
    print delta > $run/$name.mode; print none > $run/$name.engine
    print '{"round":"'$r'","fixes":[],"changed":[],"failed":[]}' > $run/changes-$r.json
    print "meaning=0 minor=0 applied=0 failed=0" > $run/$name.result
    print "VERDICT: CLEAN" > $run/$name.verdict
    log "$name: nothing changed since round $n; clean without a call"
    continue
  fi
  R2 prompt content/books/$book $run/$name.prompt.md $r $mode ${${(M)mode:#delta}:+$run/changes-$n.json}
  result=
  for attempt in 1 2; do
    log "$name: start ($mode, $eng)"
    reviewCall $name $eng
    result=$(R2 apply content/books/$book $run/$name.last.md $r $eng $mode $run/changes-$r.json 2>> $run/$name.log) && break
    log "$name: no usable answer from $eng (attempt $attempt)"
    eng=claude
  done
  [[ -n $result ]] || { log "$name: FAILED"; print FAILED > $run/DONE; return 1; }
  print $mode > $run/$name.mode; print $eng > $run/$name.engine
  print -r -- $result > $run/$name.result
  issues=$(( $(field $run/$name.result meaning) + $(field $run/$name.result minor) ))
  (( issues == 0 )) && print "VERDICT: CLEAN" > $run/$name.verdict || print "VERDICT: ISSUES $issues" > $run/$name.verdict
  cp $run/$name.last.md $evidence/$name.md 2> /dev/null
  log "$name: $result"
done
}

parts=("${(@f)$(R2 parts content/books/$book ${PART_WORDS:-40000})}")
if (( ${#parts} <= 1 )); then
  reviewLoop; exit $?
fi
print ${#parts} > $base/parts
for (( k = 1; k <= ${#parts}; k++ )); do
  run=$base/part-$k evidence=$evidenceBase/part-$k partTag="part $k/${#parts}: "
  mkdir -p $run $evidence
  [[ -f $run/DONE && $(<$run/DONE) == OK ]] && continue
  rm -f $run/DONE
  export R2_ONLY=${parts[k]} R2_PART="${scope:+$scope }$k of ${#parts}"
  reviewLoop || { print $(<$run/DONE) > $base/DONE; exit 1; }
done
run=$base partTag=
log "finished: all ${#parts} parts converged"
print OK > $base/DONE
