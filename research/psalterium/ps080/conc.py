"""Concordance over every translated psalm folder: python3.13 research/psalterium/ps080/conc.py '<latin regex>' ['<pt regex>']

Latin regex is matched against the folded Latin (no accents, j->i, ae). Prints Latin and the current prayed text.
"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
base = here.parent
sys.path.insert(0, str(base))
from latin import doLatin, fold, readVerses, resolve  # noqa: E402

laRe = re.compile(sys.argv[1], re.I)
ptRe = re.compile(sys.argv[2], re.I) if len(sys.argv) > 2 else None
for folder in sorted(base.glob('ps[0-9][0-9][0-9]')):
    if folder.name == 'ps080':
        continue
    prayedFile = folder / 'prayed.json'
    if not prayedFile.exists():
        continue
    n = int(folder.name[2:])
    latinFile = doLatin / f'Psalmorum/Psalm{n}.txt'
    if not latinFile.exists():
        continue
    try:
        pt = resolve(json.loads(prayedFile.read_text(encoding='utf-8')))
    except Exception as e:  # noqa: BLE001
        print(f'{folder.name}: {e}')
        continue
    for v in readVerses(latinFile):
        if laRe.search(fold(v['text']).lower()):
            p = pt.get(v['id'], '')
            if ptRe and not ptRe.search(p):
                mark = '!!'
            else:
                mark = '  '
            print(f"{mark}{v['id']:8} {v['text']}\n          {p}")
