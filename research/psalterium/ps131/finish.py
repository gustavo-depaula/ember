"""Ps 131: record the v2 Latinist gate in the audit, then insert the PROGRESS row (re-reads PROGRESS.md right before writing)."""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    oath = ('Held: the glossary row *si of oath* (open) rules the plain negative, as applied at 94:10 *Não entrarão no meu repouso* '
            'and 88:36 *não mentirei a Davi*; D2 lets grammar yield to the ear, and a Portuguese *Se eu entrar…* with no apodosis '
            'is heard as an unfinished condition, not a vow (MS1932 and the CNBB LH have the negative). The literal is option 2 of '
            'decision si_oath. **Flagged for Gustavo as a cross-psalm ruling (94:10, 88:36, 131:3–5)** — the gate now calls it major.')
    d['audit'].append({
        'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
        'note': 'Gate on draft 2: three majors (131:3, 4, 5 — the oath *si*), two minors; pointing identical. All held with reasons.',
        'outcomes': [
            {'verse': '131:3', 'remark': 'oath *si* resolved into a negative (major)', 'outcome': 'held', 'decision': 'si_oath', 'reason': oath},
            {'verse': '131:4', 'remark': 'same (major)', 'outcome': 'held', 'decision': 'si_oath', 'reason': 'Follows 131:3.'},
            {'verse': '131:5', 'remark': '*nem* for *et* (major)', 'outcome': 'held', 'decision': 'si_oath', 'reason': 'Follows 131:3; *nem* continues the negative as *et* continues the *si*.'},
            {'verse': '131:6', 'remark': '*falar* explanatory (minor)', 'outcome': 'held', 'decision': 'audivimus', 'reason': 'Bare *a ouvimos* is heard as hearing a voice; option.'},
            {'verse': '131:15', 'remark': '*pánibus* plural → *pão* (minor)', 'outcome': 'held', 'decision': 'panibus', 'reason': 'D42.'},
        ],
    })
    d['status'] = 'reviewed'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('audit updated')

progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 131 |') for line in lines):
    print('already there')
    raise SystemExit
start = next(i for i, line in enumerate(lines) if line.startswith('| 1 |'))
best, at = -1, None
for i, line in enumerate(lines[start:], start):
    m = re.match(r'\| (\d+) \|', line)
    if m and best < int(m.group(1)) < 131:
        best, at = int(m.group(1)), i
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after', best)
