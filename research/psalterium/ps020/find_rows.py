"""Print the glossary rows whose first cell contains each term: python3.13 research/psalterium/ps020/find_rows.py term ..."""
import re
import sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines()
for term in sys.argv[1:]:
    print('==', term)
    for n, line in enumerate(lines, 1):
        if line.startswith('| ') and re.search(term, line.split('|')[1]):
            print(f'{n}: {line[:170]}')
