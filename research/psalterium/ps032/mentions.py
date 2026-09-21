"""List glossary rows (first cell + snippet) that mention given psalm verses, e.g. 32 or 33.
python3.13 research/psalterium/ps032/mentions.py 32 33"""
import re
import sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines()
for psalm in sys.argv[1:]:
    print('==', psalm)
    regex = re.compile(rf'(?<![\d.:]){psalm}:\d+[ab]?')
    for n, line in enumerate(lines, 1):
        if not line.startswith('| '):
            continue
        for m in regex.finditer(line):
            start = max(0, m.start() - 90)
            print(f'{n} [{line.split("|")[1].strip()[:40]}] …{line[start:m.end() + 90]}…')
