"""Print glossary rows whose first cell matches any of the given regexes (case-insensitive, accent-insensitive).
Usage: python3.13 research/psalterium/ps140/gl.py [-n MAXCHARS] pat1 pat2 ..."""
import re, sys, unicodedata
from pathlib import Path

def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

args = sys.argv[1:]
n = 900
if args and args[0] == '-n':
    n = int(args[1]); args = args[2:]
anywhere = False
if args and args[0] == '-a':
    anywhere = True; args = args[1:]
lines = Path('research/psalterium/glossary.md').read_text().splitlines()
for i, line in enumerate(lines, 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    first = strip(cells[1]) if len(cells) > 1 else ''
    hay = strip(line) if anywhere else first
    for p in args:
        if re.search(strip(p), hay):
            print(f'{i}: {line[:n]}\n')
            break
