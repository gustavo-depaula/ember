"""Every DO psalm file reads to unique verse ids through latin.readVerses (repeated ids get b, c …).

    python3.13 research/psalterium/tests/unique-ids.py
"""

import sys
from collections import Counter
from pathlib import Path

here = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(here))
import latin  # noqa: E402

folder = here.parents[1] / 'content/do/horas/Latin/Psalterium/Psalmorum'
repeated, clashes = 0, []
for path in sorted(folder.glob('Psalm*.txt')):
    raw = Counter(line.split(' ', 1)[0] for line in path.read_text(encoding='utf-8').splitlines() if latin.verseLine.match(line))
    repeated += any(n > 1 for n in raw.values())
    ids = Counter(v['id'] for v in latin.readVerses(path))
    clashes += [f'{path.name}: {vid}' for vid, n in ids.items() if n > 1]
print(f'{repeated} files repeat an id in DO; {len(clashes)} clashes after suffixing')
for clash in clashes:
    print(' ', clash)
sys.exit(1 if clashes else 0)
