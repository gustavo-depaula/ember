"""Print the glossary rows that touch the Latin words of Ps 59 (first column match)."""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
lines = (root / 'glossary.md').read_text().splitlines()
pats = sys.argv[1:] or [
    'repel', 'destru', 'irasc', 'irat', 'miser', 'commov', 'conturb', 'sana', 'contrit', 'ostend', 'dura',
    'potá', 'pota', 'vin', 'compunct', 'metu', 'signific', 'fug', 'fácie', 'facie', 'arcus', 'liber', 'dilect',
    'salvum', 'dexter', 'déxter', 'exaud', 'locut', 'loqu', 'sancto', 'lætá', 'laeta', 'part', 'divid', 'dívid',
    'Sichim', 'Síchim', 'conváll', 'convall', 'tabernac', 'metí', 'meti', 'Gálaad', 'Galaad', 'Manas', 'Éphraim',
    'fortitúd', 'fortitud', 'cápit', 'caput', 'Juda', 'rex', 'Moab', 'olla', 'spe', 'Idum', 'extend', 'exténd',
    'calcea', 'alienígen', 'alienigen', 'súbdit', 'subdit', 'dedúc', 'deduc', 'civitát', 'civitat', 'munít',
    'nonne', 'egred', 'virtút', 'virtut', 'auxíl', 'auxil', 'tribul', 'vana', 'vanus', 'vánit', 'salus', 'hómin',
    'níhil', 'nihil', 'tribulánt', 'usque in',
]
for i, line in enumerate(lines, 1):
    if not line.startswith('|'):
        continue
    first = line.split('|')[1] if line.count('|') > 1 else line
    if any(p.lower() in first.lower() for p in pats):
        print(f'{i}: {line[:900]}')
        print()
