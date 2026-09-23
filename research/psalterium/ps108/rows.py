"""Print glossary rows by line number, trimmed.

usage: python3.13 research/psalterium/ps108/rows.py [--max N] line...
"""
import sys
from pathlib import Path

args = sys.argv[1:]
limit = 1800
if '--max' in args:
    i = args.index('--max')
    limit = int(args[i + 1])
    del args[i:i + 2]
lines = (Path(__file__).parent.parent / 'glossary.md').read_text().splitlines()
for a in args:
    n = int(a)
    print(f'{n}: {lines[n - 1][:limit]}\n')
