"""Map LXX token ids to verse refs. Usage: lxxref.py ID [ID...]"""
import bisect
import sys
from pathlib import Path

rows = []
for line in (Path(__file__).resolve().parents[2] / 'consult' / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
    p = line.split('\t')
    if len(p) >= 3:
        rows.append((int(p[1]), p[2]))
rows.sort()
keys = [r[0] for r in rows]
for a in sys.argv[1:]:
    i = bisect.bisect_right(keys, int(a)) - 1
    print(a, rows[i][1])
