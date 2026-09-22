"""Latin | finished (Opus) | Grok trial, verse by verse, with the same fresh-Opus Latinist's findings on each.

    python3.13 research/psalterium/trials/grok-4.7/side_by_side.py <N>   → prints markdown
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
n = int(sys.argv[1])
nnn = f'{n:03d}'
base = here / 'baseline' / f'ps{nnn}'
trial = here / f'ps{nnn}'


def reply(path):
    text = json.loads(path.read_text(encoding='utf-8'))['reply'].strip()
    text = text.removeprefix('```json').removeprefix('```').removesuffix('```')
    return json.loads(text)


def findings(path):
    out = {}
    for v in reply(path).get('verses', []):
        if v['severity'] != 'none':
            out[v['id']] = v['severity'] + ': ' + '; '.join(i['problem'] for i in v['issues'])
    return out


latin = json.loads((base / 'latin.json').read_text(encoding='utf-8'))
ours = json.loads((base / 'prayed.vos.json').read_text(encoding='utf-8'))
grok = json.loads((trial / 'prayed.vos.json').read_text(encoding='utf-8'))
fOurs = findings(base / 'critic' / 'latinist.json')
gates = sorted((trial / 'critic').glob('v*.latinist.json'))
fGrok = findings(gates[-1])
same = sum(ours[k] == grok.get(k) for k in ours)
print(f'# Ps {n}: {same}/{len(ours)} verses identical\n')
print(f'Latinist on ours: {len(fOurs)} flagged; on Grok ({gates[-1].name}): {len(fGrok)} flagged\n')
for k in latin:
    lat = latin[k] if isinstance(latin[k], str) else latin[k].get('text', latin[k])
    print(f'**{k}** {lat}')
    if ours.get(k) == grok.get(k):
        print(f'- both: {ours.get(k)}')
    else:
        print(f'- ours: {ours.get(k)}')
        print(f'- grok: {grok.get(k)}')
    for who, f in (('ours', fOurs), ('grok', fGrok)):
        if k in f:
            print(f'  - *Latinist on {who}* — {f[k]}')
    print()
