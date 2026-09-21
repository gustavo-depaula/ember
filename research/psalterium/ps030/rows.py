"""Print the glossary rows (first cell match, full row trimmed) for the terms of Ps 30 / 31.
python3.13 research/psalterium/ps030/rows.py [width] term ...   (terms are regexes on the first cell, accent-blind)"""
import re
import sys
import unicodedata
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines()


def plain(text):
    text = text.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
width = 700
if args and args[0].isdigit():
    width = int(args.pop(0))
for term in args:
    print('==', term)
    for n, line in enumerate(lines, 1):
        if line.startswith('| ') and re.search(term, plain(line.split('|')[1])):
            print(f'{n}: {line[:width]}')
