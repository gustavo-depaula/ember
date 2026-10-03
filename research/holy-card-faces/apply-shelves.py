"""Write each card's album shelf (and `several`) from shelves/batch-*.tsv.

The feast and devotion cards with a `kind` are shelved here directly; the
season, Mass, object and Rosary cards take their shelf from their kind.

    python3 research/holy-card-faces/apply-shelves.py [--check]
"""

import json
import sys
from collections import Counter
from pathlib import Path

here = Path(__file__).parent
cards_dir = Path('content/practices/saint-of-the-day/data/holy-cards')
shelves = ['lord', 'lady', 'angels', 'patriarchs', 'apostles', 'martyrs', 'bishops',
           'religious', 'laity', 'church']

moveable = {
    'ascension': 'lord', 'baptism_lord': 'lord', 'christ_king': 'lord', 'corpus_christi': 'lord',
    'divine_mercy': 'lord', 'easter': 'lord', 'holy_family': 'lord', 'pentecost': 'lord',
    'sacred_heart': 'lord', 'trinity': 'lord', 'holy_face': 'lord',
    'immaculate_heart': 'lady', 'mother_of_church': 'lady', 'undoer_of_knots': 'lady',
}

rows = {cid: (shelf, False) for cid, shelf in moveable.items()}
for tsv in sorted((here / 'shelves').glob('batch-*.tsv')):
    for line in tsv.read_text().splitlines():
        if not line.strip():
            continue
        cid, shelf, several, *_ = line.split('\t')
        assert shelf in shelves, (tsv.name, line)
        assert several in ('true', 'false'), (tsv.name, line)
        rows[cid] = (shelf, several == 'true')

missing = [p.stem for p in cards_dir.glob('*.json')
           if p.stem not in rows and json.loads(p.read_text()).get('kind') in (None, 'moveable', 'devotion')]
assert not missing, missing

print(Counter(shelf for shelf, _ in rows.values()))
if '--check' in sys.argv:
    sys.exit()

for cid, (shelf, several) in rows.items():
    path = cards_dir / f'{cid}.json'
    card = json.loads(path.read_text())
    out = {}
    for key, value in card.items():
        if key in ('shelf', 'several'):
            continue
        out[key] = value
        # The shelf reads with the card's identity, right after its name.
        if key == 'name':
            out['shelf'] = shelf
            if several:
                out['several'] = True
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
