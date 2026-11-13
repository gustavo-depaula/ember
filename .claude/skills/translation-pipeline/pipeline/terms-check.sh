#!/bin/zsh
# The term-consistency check of a translated book: terms.py flags the
# paragraphs where a Key Terms rendering is missing, and the flags go in chunks
# to one model call each (terms.system.md; Codex while it has room). The
# fixes are then verified as the review rounds verify a round's changes: delta
# reads by alternating engines (review2.system.md) until one changes nothing.
# A clean book is committed and pushed from the worktree.
#   usage: terms-check.sh <book path relative to content/books>
# State is in terms-runs/<book>/ (outside runs/, which the pools own): chunks
# (their count), check-K.md (the chunks' messages), c-K/ (each chunk's rounds),
# DONE (OK or NEEDS_REVIEW), COMMITTED.
set -u
root=$(<${0:A:h}/ROOT)
here=${0:A:h}
book=$1
base=$here/terms-runs/${book//\//__} partTag=
run=$base evidence=$base/evidence
mkdir -p $evidence
cd $root
source $here/lib.sh
# Delta reads also read the changed paragraphs' neighbours, so a round can find a
# new slip beside a verified fix; 4 rounds proved too few on De Caelo.
maxRounds=6

# The book is checked against the language it was translated from.
export SOURCE_LANG=$(python3.13 $here/terms.py lang content/books/$book)
[[ -f $base/chunks ]] || python3.13 $here/terms.py prompt content/books/$book $base/check ${CHUNK_WORDS:-40000} > $base/chunks
chunks=$(<$base/chunks)
log "check: $chunks chunk(s), source $SOURCE_LANG"

other() { [[ $1 == codex ]] && print claude || { codexOk && print codex || print claude; } }

for (( k = 1; k <= chunks; k++ )); do
  run=$base/c-$k partTag="chunk $k/$chunks: "
  mkdir -p $run
  [[ -f $run/DONE ]] && continue
  export R2_PART="terms $k of $chunks"
  while true; do
    n=$(ls $run | grep -c '^review-[0-9]*\.result$')
    if (( n >= 1 )) && [[ $(field $run/review-$n.result applied) == 0 ]]; then
      log "converged in $n round(s)"; print OK > $run/DONE; break
    fi
    if (( n >= maxRounds )); then
      log "no convergence in $maxRounds rounds"; print MAXED > $run/DONE; break
    fi
    r=$((n + 1)) name=review-$r
    if (( r == 1 )); then
      cp $base/check-$k.md $run/$name.prompt.md
      eng=$(codexOk && print codex || print claude) mode=terms sys=$here/terms.system.md
    else
      R2 prompt content/books/$book $run/$name.prompt.md $r delta $run/changes-$n.json
      eng=$(other $(<$run/review-$n.engine)) mode=delta sys=$here/review2.system.md
    fi
    result=
    for attempt in 1 2; do
      log "$name: start ($mode, $eng)"
      reviewCall $name $eng $sys
      result=$(R2 apply content/books/$book $run/$name.last.md $r $eng $mode $run/changes-$r.json 2>> $run/$name.log) && break
      log "$name: no usable answer from $eng (attempt $attempt)"
      eng=claude
    done
    [[ -n $result ]] || { log "$name: FAILED"; print FAILED > $run/DONE; break; }
    print $mode > $run/$name.mode; print $eng > $run/$name.engine
    print -r -- $result > $run/$name.result
    log "$name: $result"
  done
done

run=$base partTag=
notOk=($(grep -Lx OK $base/c-*/DONE(N)))
if (( ${#notOk} )); then
  log "finished with a chunk not converged: ${notOk:h:t}"
  print NEEDS_REVIEW > $base/DONE; exit 1
fi

# A fix replaces text inside a paragraph; a paragraph added or lost is a bad fix.
dir=content/books/$book
if ! HERE=$here python3.13 - $dir <<'PY' >> $base/status 2>&1
import os, sys, glob
sys.path.insert(0, os.environ["HERE"])
import r2
b = sys.argv[1]; bad = []
for f in sorted(glob.glob(b + "/pt-BR/*.md")):
    ch = os.path.basename(f); src = "%s/%s/%s" % (b, r2.lang(b), ch)
    if ch == "translation-journal.md" or not os.path.exists(src): continue
    if len(r2.paras(src)) != len(r2.paras(f)): bad.append(ch)
if bad: print("paragraph counts differ: " + " ".join(bad)); sys.exit(1)
PY
then
  log "check: FLAGGED (paragraph counts)"; print NEEDS_REVIEW > $base/DONE; exit 1
fi

fixes=$(cat $base/c-*/changes-1.json(N) /dev/null | jq -s '[.[].fixes | length] | add // 0')
if [[ -z $(git status --porcelain -- $dir/pt-BR) ]]; then
  log "finished: nothing to change"; print OK > $base/DONE; exit 0
fi
title=$(jq -r '.name["en-US"] // .name["pt-BR"] // empty' $dir/book.json)
# Main may have moved since the last book; this checkout has no commits of its own.
git fetch -q origin main && git merge -q --ff-only origin/main || { log "check: could not catch up with main"; print NEEDS_REVIEW > $base/DONE; exit 1; }
git add -- $dir/pt-BR
git commit -q -m "${title:-$book}: pt-BR terms made consistent with its glossary

The term-consistency check (terms.py) flagged the paragraphs where a Key
Terms rendering was missing; $fixes fix(es) from the check, verified by
delta review rounds." -- $dir/pt-BR
if ! git push -q origin HEAD:main; then
  log "check: committed $(git rev-parse --short HEAD), push failed"; print NEEDS_REVIEW > $base/DONE; exit 1
fi
git rev-parse --short HEAD > $base/COMMITTED
log "finished: committed $(<$base/COMMITTED)"
print OK > $base/DONE
