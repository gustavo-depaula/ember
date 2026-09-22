"""Print glossary rows whose first cell (the Latin) matches any of the given stems, accents ignored.
Usage: python3.13 gloss_grep.py stem1 stem2 ... [--any] (--any: match anywhere in the row, truncated)"""
import sys, unicodedata, pathlib

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

args = [a for a in sys.argv[1:] if not a.startswith('--')]
anywhere = '--any' in sys.argv
path = pathlib.Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(path.read_text().splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    key = fold(line if anywhere else cells[1] if len(cells) > 1 else '')
    hits = [a for a in args if fold(a) in key]
    if hits:
        text = line if len(line) < 1500 else line[:1500] + ' …'
        print(f'{n} [{",".join(hits)}] {text}\n')
