"""Pull the glossary rows that bear on Ps 72 (first cell matches a lemma, or the row names 72:)."""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent
text = (root / 'glossary.md').read_text()


def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae')


terms = sys.argv[1:] or [
    r'\bbonus', r'recto', r'rectus', r'moveri|commov|\bmov', r'effund', r'gressus', r'zel', r'iniqu', r'\bpax\b|pacem', r'peccator',
    r'respect', r'firmament', r'plaga', r'labor', r'flagell', r'superbi', r'operi', r'impiet', r'adeps|adip', r'affect',
    r'cogit', r'nequit', r'excels', r'\bos\b|\bos \(', r'lingua', r'convert', r'plen', r'scient', r'abund', r'divit',
    r'sine causa|frustra|vane', r'justific', r'lavare|\blav', r'innocen', r'tota die', r'castig', r'matutin', r'narr', r'natio',
    r'reprob', r'existim', r'cognosc', r'sanctuar', r'intelleg', r'noviss', r'verumtamen|veruntamen', r'dolus|dolos', r'deje|deici|dejic',
    r'allev|elev|exalt', r'desolat', r'defic|defec', r'perire|peri[bv]', r'somn', r'civitas|civitat', r'imag', r'ad nihilum|nihil',
    r'inflamm', r'renes|\bren', r'commut', r'nescir|nesciv', r'jument', r'dexter', r'voluntas|voluntat', r'deduc', r'gloria',
    r'suscip|suscep', r'velle|volui', r'caro|carne', r'\bpars\b|\bpars ', r'in aeternum', r'elong', r'perder|perdid', r'fornic',
    r'adhaer', r'spes|spem', r'annunt', r'praedic', r'porta', r'filia sion|sion', r'cor\b|corde', r'semper', r'apud te', r'tenere|tenu',
    r'ecce', r'quomodo', r'ideo', r'quia', r'autem', r'enim', r'subito', r'pes\b|pedes', r'manus', r'surg', r'dies\b', r'saecul',
]
rows = [l for l in text.splitlines() if l.startswith('| ') and not l.startswith('| ---')]
seen = set()
for t in terms:
    rx = re.compile(t)
    for r in rows:
        cells = [c.strip() for c in r.split('|')[1:-1]]
        if not cells:
            continue
        if rx.search(plain(cells[0])) and r not in seen:
            seen.add(r)
            print(f'[{t}] ' + ' | '.join(cells[:3])[:300])
            if len(cells) > 3:
                print('    NOTE: ' + cells[3][:500])
print('\n=== rows mentioning 72: ===')
for r in rows:
    if re.search(r'\b72:\d', r):
        for m in re.finditer(r'.{0,250}\b72:\d+.{0,250}', r):
            print('* ' + r.split('|')[1].strip()[:60] + ' :: ' + m.group(0))
