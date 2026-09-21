"""Resolve the outcomes left 'pending' by the unread-drafts review (unread/record.py, 2026-09-21).

Each remark follows its recommendation (take → taken, refuse → refused, option → option), keeping the reviewer's
reason, except where DECISIONS.md's review section rules otherwise:
- Ps 118, the five Latinist majors on the plural elóquia (decision `eloquia`): refused — held on purpose under D26.
- Ps 30:2 / 30:17 confúndar (Latinist majors): option — the D23 formula and the Te Deum line.
- Ps 30:12 'sobremaneira' unknown: taken by draft 4 ('grandemente').
- Ps 4:8 (ambiguity fault) and Ps 31:9b (ambiguity finding) stay pending: they are Gustavo's.
Idempotent: only outcomes still 'pending' are touched.

python3.13 research/psalterium/review/apply/resolve_pending.py
"""

import json
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[2]
by = 'main session, 2026-09-21 (DECISIONS.md, review of the finished work)'
mapped = {'take': 'taken', 'refuse': 'refused', 'option': 'option'}


def special(name, step, o):
    """(outcome, reason) for the remarks the review section rules on itself; None to follow the recommendation;
    'keep' to leave it pending."""
    verse = o.get('verse')
    if name == 'ps118' and step.get('step') == 'latinist' and o.get('decision') == 'eloquia':
        return 'refused', 'held on purpose under D26; Gustavo’s call (DECISIONS review section)'
    if name == 'ps030' and verse in ('30:2', '30:17') and o.get('decision') == 'confundar':
        return 'option', 'D23 formula and the Te Deum line; Gustavo’s call'
    if name == 'ps030' and verse == '30:12' and step.get('step') == 'ambiguity' and 'sobremaneira' in o.get('remark', ''):
        return 'taken', 'taken in draft 4: “sobremaneira” → “grandemente” (option 3 of “valde”)'
    if (name, verse) in (('ps004', '4:8'), ('ps031', '31:9b')) and step.get('step') == 'ambiguity' and o.get('recommendation') != 'refuse':
        return 'keep'
    return None


counts, kept = Counter(), []
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    path = folder / 'prayed.json'
    if not path.exists():
        continue
    prayed = json.loads(path.read_text(encoding='utf-8'))
    touched = False
    for step in prayed.get('audit', []):
        for o in step.get('outcomes') or []:
            if o.get('outcome') != 'pending':
                continue
            ruled = special(folder.name, step, o)
            if ruled == 'keep':
                kept.append(f'{folder.name} {o["verse"]} ({step["step"]}, recommended {o.get("recommendation")})')
                continue
            if ruled:
                o['outcome'], why = ruled
                o['resolution'] = f'{by}: {why}'
            else:
                o['outcome'] = mapped[o['recommendation']]
                o['resolution'] = f'{by}: as recommended'
            counts[(folder.name, o['outcome'])] += 1
            touched = True
    if touched:
        path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for key, n in sorted(counts.items()):
    print(*key, n)
print('resolved:', sum(counts.values()), dict(Counter(k[1] for k in counts.elements())))
print('left pending:', *kept, sep='\n  ')
