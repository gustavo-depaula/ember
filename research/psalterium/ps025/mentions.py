"""Print, for each glossary row, the sentences that cite a verse of the given psalms: python3.13 mentions.py 25 26 27"""
import re
import sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines()
psalms = sys.argv[1:]
pattern = re.compile(r'(?<![\d:.])(' + '|'.join(psalms) + r'):\d+[ab]?')
for n, line in enumerate(lines, 1):
    if not line.startswith('| '):
        continue
    hits = list(pattern.finditer(line))
    if not hits:
        continue
    head = line.split('|')[1].strip()[:60]
    spans = []
    for h in hits:
        a, b = max(0, h.start() - 160), min(len(line), h.end() + 160)
        spans.append(line[a:b].replace('\n', ' '))
    print(f'{n} [{head}]')
    for s in spans:
        print('   …', s)
