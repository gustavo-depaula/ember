"""Ps 125: record the v2 Latinist gate in the audit, then insert the PROGRESS row (re-reads PROGRESS.md right before writing)."""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context)',
        'note': 'Gate on draft 2: clean, no remark. Overall note: *ficamos alegres* "flattens the participle slightly but is defensible" — no fix proposed; kept (the stylist asked *ficamos*, and *alegres* is the plain predicative of *lætántes*, as the lætans row gives).',
        'outcomes': [],
    })
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('audit updated')

progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 125 |') for line in lines):
    print('already there')
    raise SystemExit
start = next(i for i, line in enumerate(lines) if line.startswith('| 1 |'))
best, at = -1, None
for i, line in enumerate(lines[start:], start):
    m = re.match(r'\| (\d+) \|', line)
    if m and best < int(m.group(1)) < 125:
        best, at = int(m.group(1)), i
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after', best)
