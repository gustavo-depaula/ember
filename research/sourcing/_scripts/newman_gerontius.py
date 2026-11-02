"""Cut The Dream of Gerontius out of Gutenberg #48927 (Egan's 1910 edition) into seven part files.
usage: newman_gerontius.py PG_TXT OUT_DIR"""
import re, sys, os
L = open(sys.argv[1], encoding='utf-8').read().split('\n')
a = next(i for i, l in enumerate(L) if l.startswith('ß1'))
b = next(i for i, l in enumerate(L) if l.startswith('[11] As suggested'))
body = L[a:b]
parts, cur = [], None
for l in body:
    m = re.match(r'^ß ?(\d)$', l)
    if m: cur = []; parts.append(cur); continue
    cur.append(l)
roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
os.makedirs(sys.argv[2] + '/en-US', exist_ok=True)
for n, lines in enumerate(parts):
    out = ['# Part ' + roman[n], '']
    for l in lines:
        s = re.sub(r'(?<=\S)\[\d+\]', '', l.rstrip())
        if not s.strip():
            if out[-1] != '': out.append('')
            continue
        if re.match(r'^[A-Z][A-Z ]+$', s) and not s.startswith(' '):
            if out[-1] != '': out.append('')
            out += ['## ' + re.sub(r'(?<=\w) (Of|The|In)\b', lambda m: m.group(0).lower(), s.title()), '']; continue
        s = re.sub(r'\s{3,}\d+$', '', s)
        s = re.sub(r'(?<=\S)\[\d+\]', '', s)
        s = s.strip().replace('eleÔson', 'eleïson').replace('--', '—')
        s = re.sub(r'(?<![\w*])_(.+?)_(?!\w)', r'*\1*', s)
        out.append(s + '  ')
    # last verse line of a stanza loses its hard break
    t = '\n'.join(out)
    t = re.sub(r'  \n\n', '\n\n', t).rstrip() + '\n'
    t = re.sub(r'  $', '', t)
    open('%s/en-US/part-%d.md' % (sys.argv[2], n + 1), 'w').write(t)
print(len(parts))
