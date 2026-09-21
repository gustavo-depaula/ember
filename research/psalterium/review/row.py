"""Print glossary rows by line number, truncated: python3.13 review/row.py 63 96 126 [--width N]"""
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
lines = (here.parent / 'glossary.md').read_text(encoding='utf-8').splitlines()
width = 700
args = sys.argv[1:]
if '--width' in args:
    width = int(args[args.index('--width') + 1])
    args = args[:args.index('--width')]
for a in args:
    print(f'{a}: {lines[int(a) - 1][:width]}\n')
