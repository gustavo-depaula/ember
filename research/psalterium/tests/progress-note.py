"""Set the version of a PROGRESS.md row and append a note to its last cell.

    python3.13 research/psalterium/tests/progress-note.py '118 (1–80)' 6 'Main session, draft 6 (D16): …'
"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row, version, note = sys.argv[1], sys.argv[2], sys.argv[3]
lines = path.read_text(encoding='utf-8').splitlines()
for i, line in enumerate(lines):
    cells = line.split(' | ')
    if cells[0].lstrip('| ').strip() == row:
        cells[2] = version
        lines[i] = ' | '.join(cells).rstrip().rstrip('|').rstrip() + f' **{note}** |'
        break
else:
    raise SystemExit(f'no row {row}')
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('updated', row)
