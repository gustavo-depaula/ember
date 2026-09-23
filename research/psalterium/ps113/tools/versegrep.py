"""Print Latin + current prayed Portuguese for given verse ids (Ps 96 lookup helper).
Usage: versegrep.py 47:12 29:5 ...  |  versegrep.py --latin REGEX  (search the Latin psalter, print hits with prayed text if any)"""
import json
import os
import re
import sys
import unicodedata

root = 'research/psalterium'
latdir = 'content/do/horas/Latin/Psalterium/Psalmorum'

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

def latin(n):
    p = os.path.join(latdir, f'Psalm{n}.txt')
    out = {}
    if not os.path.exists(p):
        return out
    for line in open(p, encoding='utf-8'):
        m = re.match(r'^(\d+:\d+[a-z]?)\s+(.*)', line.strip())
        if m:
            out[m.group(1)] = m.group(2)
    return out

def prayed(n):
    p = os.path.join(root, f'ps{int(n):03d}', 'prayed.vos.json')
    if not os.path.exists(p):
        p = os.path.join(root, f'ps{int(n):03d}', 'prayed.json')
    if not os.path.exists(p):
        return {}
    d = json.load(open(p, encoding='utf-8'))
    return d.get('verses', d) if isinstance(d, dict) else {}

args = sys.argv[1:]
if args and args[0] == '--latin':
    pat = re.compile(fold(args[1]))
    for n in range(1, 151):
        L = latin(n)
        P = None
        for vid, txt in L.items():
            if pat.search(fold(txt)):
                if P is None:
                    P = prayed(n)
                print(vid, '|', txt)
                print('   ->', P.get(vid, '(not translated)'))
else:
    for vid in args:
        n = vid.split(':')[0]
        print(vid, '|', latin(n).get(vid, '?'))
        print('   ->', prayed(n).get(vid, '(not translated)'))
