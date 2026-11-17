#!/bin/zsh
# One-off sequence (Nov 13, 2026): wait for the Traité's check, revert the
# stiff fixes of every committed book, then check the rest under the new rule.
here=${0:A:h}
L=$here/terms-runs/batch.log
while pgrep -f 'terms-check.sh francis' > /dev/null; do sleep 60; done
for c in $here/terms-runs/*/COMMITTED(N); do
  d=${c:h}; b=${${d:t}//__//}
  [[ -f $d/revert/DONE ]] && continue
  print "$(date '+%a %H:%M') revert $b" >> $L
  $here/terms-revert.sh $b >> $here/terms-runs/batch.out 2>&1
  print "$(date '+%a %H:%M') revert end $b: $(<$d/revert/DONE 2>/dev/null) $(<$d/revert/COMMITTED 2>/dev/null)" >> $L
done
print "$(date '+%a %H:%M') reverts done; resuming the checks" >> $L
$here/terms-batch.sh
print "summa" >> $L
MIN_HIT=0.9 CHUNK_WORDS=60000 $here/terms-check.sh aquinas-opera-omnia/summa-theologiae >> $here/terms-runs/batch.out 2>&1
print "$(date '+%a %H:%M') end summa: $(<$here/terms-runs/aquinas-opera-omnia__summa-theologiae/DONE 2>/dev/null)" >> $L
