"""Search glossary.md (or another file) for terms, printing a window of context around each hit."""
import re
import sys

path = 'research/psalterium/glossary.md'
args = sys.argv[1:]
if args and args[0].startswith('--file='):
    path = args[0][7:]
    args = args[1:]
width = 180
text = open(path, encoding='utf-8').read().split('\n')
for term in args:
    print('===', term)
    rx = re.compile(term, re.I)
    n = 0
    for i, line in enumerate(text, 1):
        for m in rx.finditer(line):
            s = max(0, m.start() - width)
            e = min(len(line), m.end() + width)
            print(f'{i}: …{line[s:e]}…')
            n += 1
            if n >= 10:
                break
        if n >= 10:
            break
