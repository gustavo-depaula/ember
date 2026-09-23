import re, sys
# print context windows around each keyword in a file (default glossary.md)
path = 'research/psalterium/glossary.md'
args = sys.argv[1:]
if args and args[0].startswith('--file='):
    path = args[0][7:]
    args = args[1:]
text = open(path, encoding='utf-8').read()
for kw in args:
    print('=== ' + kw)
    n = 0
    for m in re.finditer(kw, text):
        s = max(0, m.start() - 220)
        e = min(len(text), m.end() + 220)
        line = text.rfind('\n', 0, m.start()) + 1
        lineno = text.count('\n', 0, m.start()) + 1
        print(f'[{lineno}] ...' + text[s:e].replace('\n', ' ') + '...')
        n += 1
        if n >= 6:
            break
    print()
