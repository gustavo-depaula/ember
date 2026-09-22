"""Find a Latin pattern (folded, regex) in DO psalms and show the finished Portuguese beside it.
python3.13 research/psalterium/ps075/xref.py 'increpatione' 'scutum' ..."""
import json, re, sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, fold, readVerses, resolve  # noqa: E402

base = here.parent
for pat in sys.argv[1:]:
    print('==', pat)
    rx = re.compile(pat, re.I)
    for n in range(1, 151):
        f = doLatin / f'Psalmorum/Psalm{n}.txt'
        if not f.exists():
            continue
        vs = readVerses(f)
        hits = [v for v in vs if rx.search(fold(v['text']))]
        if not hits:
            continue
        pj = base / f'ps{n:03d}' / 'prayed.json'
        pt = {}
        if pj.exists() and n != 75:
            try:
                pt = resolve(json.loads(pj.read_text()))
            except Exception as e:  # noqa: BLE001
                pt = {}
        for v in hits:
            print(f"  {v['id']}: {v['text']}")
            if v['id'] in pt:
                print(f"      → {pt[v['id']]}")
