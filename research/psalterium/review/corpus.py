"""Build review/corpus.json: every finished prayed verse beside its Latin.

python3.13 review/corpus.py  → review/corpus.json and review/corpus.tsv (psalm, id, folded Latin, Latin, Portuguese).
Read-only over the psalm folders and content/do/.
"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
base = here.parent
sys.path.insert(0, str(base))
import latin  # noqa: E402

sys.path.insert(0, str(base / 'ps005'))


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    import unicodedata
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


rows = []
for folder in sorted(base.glob('ps[0-9][0-9][0-9]')):
    prayed_path = folder / 'prayed.json'
    if not prayed_path.exists():
        continue
    n = int(folder.name[2:])
    prayed = json.loads(prayed_path.read_text(encoding='utf-8'))
    text = latin.resolve(prayed)
    lat = {v['id']: v['text'] for v in latin.readVerses(latin.doLatin / 'Psalmorum' / f'Psalm{n}.txt')}
    for vid, pt in text.items():
        la = lat.get(vid)
        if la is None:
            print('no latin for', n, vid, file=sys.stderr)
            la = ''
        rows.append({'psalm': n, 'id': vid, 'la': la, 'fold': plain(la), 'pt': pt})

(here / 'corpus.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding='utf-8')
with open(here / 'corpus.tsv', 'w', encoding='utf-8') as out:
    for r in rows:
        out.write(f"{r['psalm']}\t{r['id']}\t{r['la']}\t{r['pt']}\n")
print(len(rows), 'verses from', len({r['psalm'] for r in rows}), 'psalms')
