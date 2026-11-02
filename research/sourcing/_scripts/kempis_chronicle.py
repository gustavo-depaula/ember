"""Arthur's English Chronicle of Mount St. Agnes (Project Gutenberg 16759) -> kempis-chronica-montis-s-agnetis (en-US)."""
import json, os, re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
import bookjson
from kempis_pair import AU
D = 'content/books/kempis-opera-omnia/chronica-montis-sanctae-agnetis'
L = open('research/sourcing/kempis/en/pg16759.txt').read().split('\n')


def paras(lines):
    out, cur = [], []
    for l in lines + ['']:
        if l.strip():
            cur.append(l.strip())
        elif cur:
            out.append(re.sub(r'\s+', ' ', ' '.join(cur)))
            cur = []
    return [p for p in out if p != '* * * * *']


def unit(lines):
    ps = paras(lines)
    t = ps[0] if ps else ''
    return re.sub(r'\s+', ' ', t).strip('_. '), ps[1:]


def chapt(a, b):
    idx = [i for i in range(a, b) if re.match(r'^CHAPTER [IVXL]+\.?\s*$', L[i])]
    return [(idx[k], idx[k + 1] if k + 1 < len(idx) else b) for k in range(len(idx))]


units = []  # (group, title, paras)
pre = paras(L[272:304])
units.append((None, 'Preface', pre))
for g, (a, b) in enumerate([(304, 3694), (3697, 4808)]):
    for k, (s, e) in enumerate(chapt(a, b)):
        t, ps = unit(L[s + 1:e])
        units.append((g, f'{k + 1}. {t}', ps))
# the Windesheim letter: "N.  _title_." opens each section
ls = [i for i in range(4809, 5415) if re.match(r'^[IVXL]+\.\s+_', L[i])]
ls.insert(0, 4809)
for k, s in enumerate(ls):
    e = ls[k + 1] if k + 1 < len(ls) else 5415
    seg = L[s:e]
    if k == 0:
        t, ps = 'Prologue', paras(seg[1:])
        t = 'Prologue'
    else:
        txt = ' '.join(x.strip() for x in seg[:4])
        m = re.match(r'^([IVXL]+)\.\s+_(.*?)_\.?\s', txt + ' ')
        t = re.sub(r'\s+', ' ', m.group(2)).rstrip('.')
        num = {'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10}.get(m.group(1)) or (lambda r: sum(v if (i + 1 == len(r) or v >= {'I':1,'V':5,'X':10}[r[i+1]]) else -v for i, v in enumerate({'I':1,'V':5,'X':10}[c] for c in r)))(m.group(1))
        n = 0
        # drop the title lines from the body
        body = '\n'.join(seg)
        body = re.sub(r'^[IVXL]+\.\s+_.*?_\.?\s*', '', body, count=1, flags=re.S)
        ps = paras(body.split('\n'))
    units.append((2, f'{num}. {t}' if k else t, ps))
groups = ['Of the foundation and the first Fathers of Mount St. Agnes', 'From the chronicle: matters not pertaining to our house', 'A letter concerning the first institution of the monastery at Windesheim (William Vornken)']
os.makedirs(D + '/en-US', exist_ok=True)
toc, cnt, words = [{'id': 'preface', 'title': {'en-US': 'Preface'}}], {}, 0
nodes = {}
for g, t, ps in units:
    if g is None:
        cid = 'preface'
        title = 'Preface'
    else:
        cnt[g] = cnt.get(g, 0) + 1
        cid = f'p{g + 1}-{cnt[g]:02d}'
        title = t
        nodes.setdefault(g, []).append({'id': cid, 'title': {'en-US': title}})
    s = '# ' + title + '\n\n' + '\n\n'.join(ps) + '\n'
    words += len(s.split())
    open(f'{D}/en-US/{cid}.md', 'w').write(s)
for g in sorted(nodes):
    toc.append({'id': f'part-{g + 1}', 'title': {'en-US': groups[g]}, 'children': nodes[g]})
os.makedirs(D + '/sources/en-US-originals', exist_ok=True)
os.system(f"cp research/sourcing/kempis/en/pg16759.txt {D}/sources/en-US-originals/")
bookjson.write(D, {'id': 'kempis-chronica-montis-s-agnetis', 'cover': 'classic',
  'name': {'en-US': 'The Chronicle of the Canons Regular of Mount St. Agnes', 'pt-BR': 'A Crônica dos Cônegos Regulares do Monte Santa Inês', 'la': 'Chronica Montis S. Agnetis'},
  'author': AU,
  'description': {'en-US': 'Thomas\'s history of his own monastery near Zwolle, from its foundation by the disciples of Gerard Groote in 1384 to his own day: the first brothers, the building, the priors and their deaths, the visitations and the lay brothers, with a section from his chronicle on events outside the house and William Vornken\'s letter on the origins of Windesheim. English only (J. P. Arthur, 1906); Pohl\'s Latin (Opera omnia VII, 1922) is not yet imported.',
   'pt-BR': 'A história que Tomás escreveu de seu próprio mosteiro perto de Zwolle, desde a fundação pelos discípulos de Gerardo Groote, em 1384: os primeiros irmãos, a construção, os priores e suas mortes, com a carta de Guilherme Vornken sobre as origens de Windesheim.',
   'la': 'Chronica canonicorum regularium Montis S. Agnetis a Thoma a Kempis conscripta. Versio Anglica tantum.'},
  'composed': 'c. 1471', 'languages': ['en-US'], 'work': 'thomas-a-kempis/chronica-montis-sanctae-agnetis',
  'editions': {'en-US': {'translator': 'J. P. Arthur', 'year': 1906}},
  'sources': [{'language': 'en-US', 'url': 'https://www.gutenberg.org/ebooks/16759', 'edition': 'The Chronicle of the Canons Regular of Mount St. Agnes, tr. J. P. Arthur (London: Kegan Paul, Trench, Trubner 1906); Project Gutenberg 16759, produced by Les Bowler.',
   'description': 'The preface, the 29 chapters of the Chronicle, the 24 chapters "From the chronicle of our Brother Thomas of Kempen concerning matters not pertaining to our house" and the 30 sections of William Vornken\'s letter on Windesheim, as the translation prints them. The translator\'s note and the Gutenberg licence are dropped.', 'tier': 'A', 'tierEvidence': 'Published 1906; Project Gutenberg.'}],
  'toc': toc})
print(len(units), words)
