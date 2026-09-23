"""Print the rendered Portuguese (prayed.vos.json) beside the DO Latin for given verse ids. Usage: show.py 24:21 62:8b ..."""
import json
import os
import sys

base = 'research/psalterium'
latdir = 'content/do/horas/Latin/Psalterium/Psalmorum'
for vid in sys.argv[1:]:
    n = int(vid.split(':')[0])
    lat = ''
    p = f'{latdir}/Psalm{n}.txt'
    if os.path.exists(p):
        for line in open(p, encoding='utf-8'):
            if line.startswith(vid + ' '):
                lat = line.strip()
    pt = '(no draft)'
    q = f'{base}/ps{n:03d}/prayed.vos.json'
    if os.path.exists(q):
        pt = json.load(open(q, encoding='utf-8')).get(vid, '(no verse)')
    print(f'{lat}\n   → {pt}\n')
