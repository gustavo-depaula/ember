"""Check the verse lists cited in glossary_part3.py against the DO Latin (accents stripped for matching).
python3.13 research/psalterium/ps118/grep_latin_part3.py"""

import re
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do/horas/Latin/Psalterium/Psalmorum'


def plain(s):
    s = s.replace('æ', 'ae').replace('Æ', 'Ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


lines = []
for n in range(1, 151):
    f = root / f'Psalm{n}.txt'
    if f.exists():
        for line in f.read_text(encoding='utf-8').splitlines():
            m = re.match(r'(\d+:\d+[a-z]?) (.*)', line)
            if m:
                lines.append((m.group(1), plain(m.group(2))))

patterns = {
    'deficere in': r'\bdefec\w*\b.*\bin \w+|\bdefici\w*\b.*\bin ',
    'exspect': r'exspect',
    'in consummatione': r'consummation',
    'prohibe': r'\bprohib',
    'fauces': r'\bfauc',
    'lucerna': r'lucern',
    'laqueum': r'laqueum',
    'errare': r'\berra[vn]|\berrant',
    'faciend': r'faciend',
    'praevaric': r'praevaric',
    'config': r'\bconfig|\bconfix',
    'facere judicium/justitiam': r'\bfac\w+ (judicium|justitiam)|\bfec\w+ (judicium|justitiam)|(judicium|justitiam) \w* ?fac',
    'calumni': r'calumni',
    'fac mecum / fac cum': r'\bfac (mecum|cum)',
    'dissip': r'dissip',
    'tota die': r'tota die',
    'in generationem et generationem': r'generatione\w* et generatione',
    'perseverare': r'persever',
}
for name, pat in patterns.items():
    hits = [vid for vid, t in lines if re.search(pat, t)]
    print(f'{name} ({len(hits)}):', ', '.join(hits))
