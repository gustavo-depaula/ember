"""Query the finished corpus: python3.13 review/q.py '<latin regex>' ['<portuguese regex>'] [--all]

Latin regex is folded (accents, æ, case) like the text. With a Portuguese regex, verses whose Portuguese does NOT match
are flagged '!!' (with --all both kinds are shown; without, only misses and a count of hits).
Also counts the regex over the whole DO Latin psalter (Pss 1–150) for recounts.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

here = Path(__file__).resolve().parent
root = here.parents[2] / 'content/do/web/www/horas/Latin/Psalterium/Psalmorum'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


args = [a for a in sys.argv[1:] if not a.startswith('--')]
show_all = '--all' in sys.argv
count_all = '--count' in sys.argv
la_re = re.compile(plain(args[0]))
pt_re = re.compile(args[1], re.I) if len(args) > 1 else None
rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
hits = miss = 0
for r in rows:
    if not la_re.search(r['fold']):
        continue
    ok = pt_re.search(r['pt']) if pt_re else True
    if ok:
        hits += 1
    else:
        miss += 1
    if show_all or not ok or not pt_re:
        flag = '  ' if ok else '!!'
        print(f"{flag} {r['id']:8} {r['la']}\n            {r['pt']}")
print(f'-- finished: {hits} match, {miss} miss')
if count_all:
    lines = 0
    ids = []
    for path in sorted(root.glob('Psalm*.txt'), key=lambda p: int(re.search(r'\d+', p.stem).group())):
        n = int(re.search(r'\d+', path.stem).group())
        if n > 150:
            continue
        for line in path.read_text(encoding='utf-8').splitlines():
            if re.match(r'^\d+:\d+', line) and la_re.search(plain(line)):
                lines += 1
                ids.append(line.split()[0])
    print(f'-- whole psalter (1–150): {lines} lines: {" ".join(ids)}')
