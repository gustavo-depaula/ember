"""Keyword-in-context over glossary.md (or another file): python3.13 kwic.py term [term ...] [--file F] [--w N]"""
import sys, re, pathlib, unicodedata

args = sys.argv[1:]
path = pathlib.Path(__file__).resolve().parent.parent / 'glossary.md'
w = 160
if '--file' in args:
    i = args.index('--file'); path = pathlib.Path(args[i + 1]); del args[i:i + 2]
if '--w' in args:
    i = args.index('--w'); w = int(args[i + 1]); del args[i:i + 2]
text = unicodedata.normalize('NFC', path.read_text())
for t in args:
    t = unicodedata.normalize('NFC', t)
    print('==', t)
    n = 0
    for m in re.finditer(re.escape(t), text, re.I):
        s = text[max(0, m.start() - w):m.end() + w].replace('\n', ' ')
        line = text.count('\n', 0, m.start()) + 1
        print(f'  [{line}] …{s}…')
        n += 1
        if n >= 8:
            break
