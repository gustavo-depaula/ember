#!/bin/zsh
# Undoes a committed book's term-check fixes that made the reading worse
# (terms-revert.py): Codex judges the saved fix lists in chunks, the marked
# fixes are put back, and the book is committed and pushed.
#   usage: terms-revert.sh <book path relative to content/books>
# State is in terms-runs/<book>/revert/.
set -u
root=$(<${0:A:h}/ROOT)
here=${0:A:h}
book=$1
check=$here/terms-runs/${book//\//__}
base=$check/revert partTag="revert: "
run=$base evidence=$base
mkdir -p $base
cd $root
source $here/lib.sh
[[ -f $base/DONE ]] && exit 0

[[ -f $base/chunks ]] || python3.13 $here/terms-revert.py prompt $check $base/judge 400 > $base/chunks
chunks=$(<$base/chunks)
answers=()
for (( k = 1; k <= chunks; k++ )); do
  name=judge-$k
  if [[ ! -s $base/$name.last.md ]] || ! grep -q '"revert"' $base/$name.last.md; then
    cp $base/judge-$k.md $base/$name.prompt.md
    eng=$(codexOk && print codex || print claude)
    log "$name: start ($eng)"
    reviewCall $name $eng $here/terms-revert.system.md
    grep -q '"revert"' $base/$name.last.md || { log "$name: no usable answer"; print FAILED > $base/DONE; exit 1; }
  fi
  answers+=($base/$name.last.md)
done

dir=content/books/$book
git fetch -q origin main && git merge -q --ff-only origin/main || { log "could not catch up with main"; print FAILED > $base/DONE; exit 1; }
result=$(python3.13 $here/terms-revert.py apply $dir $check $answers) || { log "apply failed"; print FAILED > $base/DONE; exit 1; }
log "$result"
if [[ -z $(git status --porcelain -- $dir/pt-BR) ]]; then
  print OK > $base/DONE; exit 0
fi
n=$(jq '.reverted | length' $check/revert.json)
title=$(jq -r '.name["en-US"] // .name["pt-BR"] // empty' $dir/book.json)
git add -- $dir/pt-BR
git commit -q -m "${title:-$book}: undo $n pt-BR term fixes that made the reading stiffer

The term-consistency check had replaced plain words with the glossary's
rarer ones where nothing in the sense was at stake (enganos → dolos). Those
fixes are put back; the ones that restored a concept, a term of art or a
name stay." -- $dir/pt-BR
git push -q origin HEAD:main || { log "push failed"; print FAILED > $base/DONE; exit 1; }
log "committed $(git rev-parse --short HEAD)"
git rev-parse --short HEAD > $base/COMMITTED
print OK > $base/DONE
