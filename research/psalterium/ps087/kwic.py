"""Keyword-in-context over a file (default glossary.md). Ps 87 helper.
Usage: kwic.py <width> <regex> [<regex> ...] [--file path]"""
import re
import sys

args = sys.argv[1:]
path = 'research/psalterium/glossary.md'
if '--file' in args:
    i = args.index('--file')
    path = args[i + 1]
    args = args[:i] + args[i + 2:]
w = int(args[0])
text = open(path, encoding='utf-8').read()
for pat in args[1:]:
    print('=== ' + pat)
    n = 0
    for m in re.finditer(pat, text, re.I):
        s = max(0, m.start() - w)
        print('…' + text[s:m.end() + w].replace('\n', ' ') + '…')
        n += 1
        if n >= 8:
            break
