"""List the psalter verses that contain a Latin stem (accents stripped), to verify the verse lists quoted in
ps118/glossary_part4.json.   python3.13 research/psalterium/ps118/grep_stems.py stem [stem …]"""

import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do/web/www/horas/Latin/Psalterium/Psalmorum'


def plain(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower().replace('æ', 'ae').replace('œ', 'oe')


for stem in sys.argv[1:]:
    hits = []
    for path in sorted(root.glob('Psalm*.txt'), key=lambda p: int(re.sub(r'\D', '', p.stem) or 0)):
        if int(re.sub(r'\D', '', path.stem) or 0) > 150:
            continue
        for line in path.read_text(encoding='utf-8').splitlines():
            m = re.match(r'(\d+:\d+\w?)\s', line)
            if m and re.search(stem, plain(line)):
                hits.append(m.group(1))
    print(f'{stem}: {len(hits)} — {", ".join(hits)}')
