"""Ps 88 helper: keyword-in-context over a file. Usage: python3.13 kwic.py FILE REGEX [width]"""
import re, sys, pathlib

path, pat = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 200
text = pathlib.Path(path).read_text()
for n, line in enumerate(text.splitlines(), 1):
    for m in re.finditer(pat, line):
        a, b = max(0, m.start() - w), min(len(line), m.end() + w)
        first = line.split('|')[1].strip()[:60] if line.startswith('|') else ''
        print(f'{n} [{first}] …{line[a:b]}…\n')
