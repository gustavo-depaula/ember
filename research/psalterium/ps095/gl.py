import re, sys
path = 'research/psalterium/glossary.md'
lines = open(path, encoding='utf-8').read().split('\n')
pats = sys.argv[1:]
width = 900
for i, l in enumerate(lines):
    head = l[:200].lower()
    for p in pats:
        if re.search(p, head):
            print(i + 1, l[:width])
            print()
            break
