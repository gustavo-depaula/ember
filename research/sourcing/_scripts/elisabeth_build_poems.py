import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from elisabeth_souvenirs import *
ROOT = '/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/'
T = [("La Carmélite", r'^La Carm.lite\s*\^'), ("Noël 1902", r'^No.l 1902'), ("Noël 1904", r'^No.l 1904'), ("Noël 1905", r'^No.l 1905'),
     ("Instaure omnia in Christo", r'^Instaure omnia'), ("Le Ciel de la gloire et le Ciel de la foi", r'^Le Ciel de la gloire'),
     ("Les lois de l’amour", r'^Les lois de l'), ("Le rêve d’une Louange de gloire", r'^Le r.ve d'), ("Le Ciel dans l’âme", r'^Le Ciel dans'),
     ("Rendez-vous de Laudem gloriæ à sa chère sœur", r'^Rendez-vous de'), ("À sa Mère Prieure, pour un anniversaire", r'^Immensus Pater'),
     ("Qui est comme Dieu !", r'^Qui est comme Dieu'), ("À l’une de ses sœurs", r"^A l'une de ses s")]
bl = blocks(fr[12786:13716])
cur = None; poems = {}; notes = {}; n = 0
for b in bl:
    t = join_lines(b)
    if is_head(t, FRH) or re.match(r'^POÉSIES|^POÊSIKS|^de Sœur', t): continue
    k = next((i for i, (_, rx) in enumerate(T) if re.search(rx, t)), None)
    if k is not None and (cur is None or k == cur + 1):
        cur = k; poems[k] = []
        if k == 10: poems[k].append(('p', 'Immensus Pater, immensus Filius, immensus Spiritus sanctus.'))
        continue
    if cur is None: continue
    if t == 'sanctus.' or re.match(r'^A SA M', t): continue
    if re.match(r'^\(\d\)\s', t):
        n += 1; notes[n] = re.sub(r'^\(\d\)\s+', '', t); poems[cur].append(('fn', n)); continue
    if re.match(r'^A SA M', t) or re.match(r'^(Air|Aiu)\s*:', t) or re.match(r'^A\s+LNK|^A\s+une S', t):
        poems[cur].append(('i', t)); continue
    if len(b) == 1 and len(t) < 140 and not re.search(r'[a-z]{3}', t[:3]) and False: pass
    ls_ = [re.sub(r'\s+', ' ', l) for l in b]
    if len(ls_) == 1 and poems[cur] and poems[cur][-1][0] == 'v' and poems[cur][-1][2:] == (1,) and len(poems[cur][-1][1]) < 4:
        poems[cur][-1][1].append(ls_[0])
    else:
        poems[cur].append(('v', ls_) + ((1,) if len(ls_) == 1 else ()))
d = ROOT + 'poesies/fr-FR/'; os.makedirs(d, exist_ok=True); tot = 0
for k, (title, _) in enumerate(T):
    out = ['# ' + title, '']; fns = []
    for kind, v, *_ in poems.get(k, []):
        if kind == 'fn': fns.append(v)
        elif kind == 'i': out += ['*%s*' % fix_fr(v), '']
        elif kind == 'p': out += [v, '']
        else:
            out += ['\\\n'.join(fix_fr(l) for l in v), '']
    if fns:
        out[2:2] = [''] if False else []
        out[1:1] = []
        out += [''.join('[^%d]: %s\n\n' % (f, fix_fr(notes[f])) for f in fns).rstrip(), '']
        # reference marker on the first verse line
        for i, l in enumerate(out):
            if i > 1 and not l.startswith('*') and l.strip() and not l.startswith('['):
                out[i] = l + ''.join('[^%d]' % f for f in fns); break
    txt = '\n'.join(out).rstrip() + '\n'
    open(d + 'p%02d.md' % (k + 1), 'w').write(txt); tot += len(txt.split())
print(tot)
