#!/bin/zsh
# Keeps up to <slots> drivers (run-book2.sh) of one engine busy, taking book paths
# from queue.txt (one per line, relative to content/books). Several pools (one
# per engine) share the queue: a book is claimed by atomically creating its
# run dir, so lines can be appended while pools run.
# usage: pool.sh <codex|claude> <slots>
# A claimed book is active until its driver writes runs/<book>/DONE — counted
# from files, not pgrep, because any shell whose command line mentions the
# script would match.
set -u

here=${0:A:h}
root=$(<$here/ROOT)
engine=$1
slots=$2
mkdir -p $here/runs

active() {
  local n=0 d e
  for d in $here/runs/*(N/); do
    e=codex; [[ -f $d/engine ]] && e=$(<$d/engine)
    [[ $e == $engine && ! -f $d/DONE ]] && (( n++ ))
  done
  print $n
}

claimNext() { # prints the claimed book, or nothing when the queue is exhausted
  local b
  for b in ${(f)"$(<$here/queue.txt)"}; do
    [[ -z $b || $b == \#* ]] && continue
    if mkdir $here/runs/${b//\//__} 2> /dev/null; then
      print $engine > $here/runs/${b//\//__}/engine
      print -r -- $b; return
    fi
  done
}

while true; do
  while (( $(active) >= slots )); do sleep 60; done
  next=$(claimNext)
  if [[ -z $next ]]; then
    (( $(active) == 0 )) && break
    sleep 60; continue
  fi
  # A book over PART_WORDS is reviewed in parts; one too long for one run
  # (the Summa) is queued part by part as `<book>#<scope>`.
  nohup $here/run-book2.sh $next > $here/runs/${next//\//__}/driver.err 2>&1 &
done
print "$engine pool drained $(date '+%H:%M:%S')" > $here/POOL_DONE.$engine
