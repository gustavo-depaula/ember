"""Carry DECISIONS.md D26 into glossary.md. Run once; idempotent; reads and writes in one step.

    python3.13 research/psalterium/ps118/glossary_d26.py
"""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
lines = path.read_text(encoding='utf-8').splitlines()
note = ' **D26 (draft 17): the clause now serves the plural too — *o que dissestes* in all twenty places of Ps 118 (the stylist refused *ditos* 8 times of 8 and passed the clause at 118:148, 158, 162 when re-read); the one noun left is 118:123 *o dito da vossa justiça*. Outside Ps 118 the psalm decides locally (11:7, 17:31, 104:19, 147:4 have a genitive or are subjects).**'
for i, line in enumerate(lines):
    if line.startswith('| verbum / sermo / elóquium |') and 'D26' not in line:
        line = line.replace('plural **os vossos ditos**, singular **o que dissestes**', '***o que dissestes*** in both numbers (before D26 the plural was *os vossos ditos*)', 1)
        line = line.replace('settled (D15, D16)', 'settled (D15, D16, D26)', 1)
        lines[i] = line.rstrip().rstrip('|').rstrip() + note + ' |'
    if line.startswith('| **elóquium — evidence from 118:81–128') and 'D26' not in line:
        lines[i] = line.rstrip().rstrip('|').rstrip() + ' **Ruled in D26: a fourth way, the clause in both numbers.** |'
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('glossary: D26 carried')
