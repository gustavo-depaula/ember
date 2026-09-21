"""Carry DECISIONS.md D25 into glossary.md. Run once; idempotent; reads and writes in one step.

    python3.13 research/psalterium/ps007/glossary_d25.py
"""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
lines = path.read_text(encoding='utf-8').splitlines()
notes = {
    '| convértere |': ' **D25: the one exception — *converter* where men are told to turn to God (7:13 *Se não vos converterdes*; “vos voltardes” was heard as said to God).**',
    '| dedúcere, *deduc me* |': ' **D25: *guiar* is for guidance; *dedúcere in púlverem* (7:6; 21:16) is *fazer descer ao pó*.**',
}
for i, line in enumerate(lines):
    for head, note in notes.items():
        if line.startswith(head) and note.strip() not in line:
            lines[i] = line.rstrip().rstrip('|').rstrip() + note + ' |'
    if line.startswith('| psállere |') and '| open |' in line:
        lines[i] = line.replace('| open |', '| settled (D25) |', 1)
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('glossary: D25 carried')
