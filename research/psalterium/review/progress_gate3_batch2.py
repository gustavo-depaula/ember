"""Append the final-gate note to the status cell of each psalm's PROGRESS.md row (re-reads the file before each edit)."""

from pathlib import Path

path = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
tail = ', outcomes recorded (2026-09-23)'
notes = {
    67: 'no major, 8 minors — 5 held as options, 3 refused',
    68: 'no major, 2 minors held as options',
    75: 'no major, 1 minor held as an option',
    82: 'clean',
    88: '**one major held** (88:36 the oath formula, pending for Gustavo with 94:10 and 131:3–5), 3 minors held as options',
    89: 'no major, 3 minors held as options',
    90: 'no major, 2 minors held as options',
    110: 'clean',
    138: '**one major held** (138:15 *os meum*, pending for Gustavo with 101:6), 2 minors — 1 held as an option, 1 refused',
    145: '**one major held** (145:4 *suam*, pending for Gustavo), 1 minor held as an option',
}

for number, note in notes.items():
    lines = path.read_text(encoding='utf-8').split('\n')
    hits = [i for i, line in enumerate(lines) if line.startswith(f'| {number} |')]
    assert len(hits) == 1, (number, hits)
    i = hits[0]
    if 'final gate on draft 3 (critic/v3)' in lines[i]:
        continue
    cells = lines[i].split(' | ')
    cells[3] += f'; final gate on draft 3 (critic/v3): {note}{tail}'
    lines[i] = ' | '.join(cells)
    path.write_text('\n'.join(lines), encoding='utf-8')
    print(number, 'ok')
