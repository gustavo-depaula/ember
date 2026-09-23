"""Print rendered verses (prayed.vos.json) of given ids across psalm folders, beside the Latin. Usage: vgrep.py 79:2 44:7 ..."""
import json
import os
import re
import sys

root = 'research/psalterium'
for vid in sys.argv[1:]:
    ps = int(vid.split(':')[0])
    f = os.path.join(root, f'ps{ps:03d}', 'prayed.vos.json')
    lat = ''
    lf = f'content/do/horas/Latin/Psalterium/Psalmorum/Psalm{ps}.txt'
    if os.path.exists(lf):
        for line in open(lf, encoding='utf-8'):
            if line.startswith(vid + ' '):
                lat = line.strip()
    txt = '(no file)'
    if os.path.exists(f):
        d = json.load(open(f, encoding='utf-8'))
        v = d.get('verses', d)
        txt = v.get(vid, '(no verse)')
    print(lat)
    print('   ', txt)
