"""Mark glossary rows as settled by a DECISIONS.md entry.

    python3.13 research/psalterium/tests/settle.py D15 'justificatiónes' 'judícia / judícium' …

Each argument is the exact first cell of a row of glossary.md; its status cell becomes `settled (Dn)`, keeping what
the old status said after a semicolon when it was more than a bare word.
"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
tag, names = sys.argv[1], sys.argv[2:]
lines = path.read_text(encoding='utf-8').splitlines()
done = []
for i, line in enumerate(lines):
    cells = line.split(' | ')
    if len(cells) >= 3 and cells[0].lstrip('| ').strip() in names:
        old = cells[2].strip()
        cells[2] = f'settled ({tag})' if old in ('working', 'open') else f'settled ({tag}); was: {old}'
        lines[i] = ' | '.join(cells)
        done.append(cells[0].lstrip('| ').strip())
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('settled:', ', '.join(done) or 'nothing', '| not found:', ', '.join(n for n in names if n not in done) or 'none')
