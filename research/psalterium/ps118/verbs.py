"""The recurring verbs of Ps 118 — verse lists for the table in words/ps118-terms.md.

Run from the repo root:  python3.13 research/psalterium/ps118/verbs.py
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from latin import doLatin, readVerses, words  # noqa: E402

stems = {
    'custodire': r'^custod',
    'exquirere': r'^exqui',
    'quaerere': r'^quae(r|s)',
    'requirere': r'^requi',
    'scrutari': r'^scrut',
    'meditari/meditatio': r'^medit',
    'exerceri': r'^exerce',
    'considerare': r'^consider',
    'docere': r'^(doce|docu)',
    'discere': r'^(disc|didic)',
    'vivificare': r'^vivific',
    'confundi': r'^confund',
    'oblivisci': r'^obli',
    'declinare': r'^declin',
    'diligere': r'^(dilig|dilex)',
    'supersperare/sperare': r'^(super)?sper',
    'intelligere/intellectus': r'^intell',
    'via': r'^(via|viae|viam|vias|viis)$',
}
verses = readVerses(doLatin / 'Psalmorum/Psalm118.txt')
for name, pattern in stems.items():
    hits = [(v['verse'], w) for v in verses for w in words(v['text']) if re.search(pattern, w)]
    print(f"{name}: {len(hits)} — " + ', '.join(f'{n} {w}' for n, w in hits))
