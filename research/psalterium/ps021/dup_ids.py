"""List DO psalm files whose verse ids repeat (Ps 21 has 21:15, 21:17, 21:25, 21:28 twice).

Run from the repo root: python3.13 research/psalterium/ps021/dup_ids.py
"""

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from latin import doLatin, readVerses  # noqa: E402

for n in range(1, 151):
    path = doLatin / f'Psalmorum/Psalm{n}.txt'
    if not path.exists():
        continue
    ids = Counter(v['id'] for v in readVerses(path))
    dups = [k for k, c in ids.items() if c > 1]
    if dups:
        print(n, dups)
