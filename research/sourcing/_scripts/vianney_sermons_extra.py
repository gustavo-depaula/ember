import sys, os, re, json
sys.path.insert(0, os.path.dirname(__file__))
from vianney_sermons import *
def chap(a, b, title, cid, heads=None):
    paras, notes = clean(L[a:b], [vhead] + [re.compile(r'^NOTES?[.,]?\s*\d{0,3}$')], 'num', re.compile(r'^TABLE DES MATI'))
    paras = [INL.sub(' ', p).strip() for p in paras]
    paras = [p for p in paras if len(p) > 2 and not re.match(r'^FIN DU TOME', p)]
    txt = render(title, paras, notes, fix_t)
    open(ROOT + 'fr-FR/' + cid + '.md', 'w').write(txt); return len(txt.split())
pre = next(i for i, l in enumerate(L) if l.strip().startswith('PRÉFACE'))
print(chap(pre + 1, 299, 'Préface de l’éditeur', 'preface'))
for k, (a, b) in enumerate(((15889, 16194), (34304, 34485), (50315, 50357), (61161, 61514)), 1):
    print(chap(a, b, 'Notes de l’éditeur (tome %s)' % ['I','II','III','IV'][k-1], 'notes-%d' % k))
