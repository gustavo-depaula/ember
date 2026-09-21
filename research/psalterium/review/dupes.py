"""Glossary rows that may be duplicates: rows (Terms and Formulas) whose Latin cells share a folded head word or
whose italic Latin phrases coincide. python3.13 review/dupes.py"""
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

here = Path(__file__).resolve().parent


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


lines = (here.parent / 'glossary.md').read_text(encoding='utf-8').splitlines()
heads = defaultdict(list)
phrases = defaultdict(list)
for i, line in enumerate(lines, 1):
    if not line.startswith('| ') or line.startswith('| ---') or line.startswith('| Latin') or line.startswith('| |'):
        continue
    lat = line.strip().strip('|').split('|')[0]
    words = re.findall(r'[a-z]+', plain(re.sub(r'\([^)]*\)', ' ', lat)))
    if words:
        heads[words[0]].append((i, lat.strip()[:90]))
    for chunk in re.findall(r'\*([^*]+)\*', lat):
        key = ' '.join(re.findall(r'[a-z]+', plain(chunk)))
        if len(key.split()) >= 2:
            phrases[key].append(i)
print('## same head word')
for w, items in sorted(heads.items()):
    if len(items) > 1 and w not in {'in', 'et', 'a', 'ad', 'de', 'the', 'qui', 'non', 'ps', 'domine', 'dominus', 'deus', 'quoniam', 'ego'}:
        print(w)
        for i, lat in items:
            print(f'   {i:4} {lat}')
print('\n## identical italic Latin phrase in more than one row')
for k, ls in phrases.items():
    if len(set(ls)) > 1:
        print(sorted(set(ls)), k)
