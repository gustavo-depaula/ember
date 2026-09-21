"""Print glossary row keys (first cell) for lines of interest. python3.13 rows.py <regex>"""
import re
import sys
from pathlib import Path

g = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').split('\n')
pat = re.compile(sys.argv[1], re.I)
for i, line in enumerate(g, 1):
    if line.startswith('|'):
        key = line.split('|')[1]
        if pat.search(key):
            print(i, '|' + key + '|', '→', line.split('|')[2][:50], '·', line.split('|')[3][:20] if len(line.split('|')) > 3 else '')
