#!/bin/zsh
# Runs terms-check.sh over terms-queue.txt, one book at a time, skipping books
# already done. Log: terms-runs/batch.log.
here=${0:A:h}
for b in ${(f)"$(<$here/terms-queue.txt)"}; do
  [[ $b == \#* || -z $b ]] && continue
  [[ -f $here/terms-runs/${b//\//__}/DONE ]] && continue
  print "$(date '+%a %H:%M') start $b" >> $here/terms-runs/batch.log
  $here/terms-check.sh $b >> $here/terms-runs/batch.out 2>&1
  print "$(date '+%a %H:%M') end $b: exit $? $(<$here/terms-runs/${b//\//__}/DONE 2>/dev/null) $(<$here/terms-runs/${b//\//__}/COMMITTED 2>/dev/null)" >> $here/terms-runs/batch.log
done
print "$(date '+%a %H:%M') queue drained" >> $here/terms-runs/batch.log
