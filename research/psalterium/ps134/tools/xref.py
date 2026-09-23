"""Find Latin verses matching a regex (accent-folded) across the psalter and show the prayed Portuguese where it exists.
Usage: python3.13 research/psalterium/ps134/tools/xref.py 'regex' ['regex2' ...]
"""
import json
import os
import re
import sys
import unicodedata

root = 'research/psalterium'
latdir = 'content/do/horas/Latin/Psalterium/Psalmorum'


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')


pats = [re.compile(fold(p)) for p in sys.argv[1:]]
for n in range(1, 151):
    path = f'{latdir}/Psalm{n}.txt'
    if not os.path.exists(path):
        continue
    pt = {}
    vp = f'{root}/ps{n:03d}/prayed.vos.json'
    if os.path.exists(vp):
        pt = json.load(open(vp, encoding='utf-8'))
    for line in open(path, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        vid, _, text = line.partition(' ')
        if any(p.search(fold(text)) for p in pats):
            print(vid, text)
            if vid in pt:
                print('   ->', pt[vid])
