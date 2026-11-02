import sys, re, html
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from core import *
import olier_meta as om
from mkbook import make
raw = open(ROOT / 'research/sourcing/olier/jm_vie_vierge.html', 'rb').read().decode('cp1252', errors='replace')
raw = re.sub(r'(?is)<(script|style).*?</\1>', '', raw)
raw = re.sub(r'(?i)</?(p|br|center|div|h\d|li|tr)[^>]*>', '\n', raw)
txt = html.unescape(re.sub(r'<[^>]+>', '', raw)).replace('\xa0', ' ')
lines = [re.sub(r'\s+', ' ', l).strip() for l in txt.split('\n')]
# join wrapped lines into paragraphs: html source wraps mid-paragraph, <p> gives breaks -> blank markers lost; rebuild from raw
paras_raw = re.split(r'(?i)<p[^>]*>', re.sub(r'(?is)<(script|style).*?</\1>', '', open(ROOT / 'research/sourcing/olier/jm_vie_vierge.html', 'rb').read().decode('cp1252', errors='replace')))
P = []
for p in paras_raw:
    t = html.unescape(re.sub(r'<[^>]+>', ' ', p)).replace('\xa0', ' ')
    t = re.sub(r'\s+', ' ', t).strip()
    if t:
        P.append(t)
CHH = re.compile(r'^CHAPITR\w*\s+([IVXL]+)\s*[.,]?\s*(.*)$')
# body starts after the table of contents: second occurrence of the title line
first = next(i for i, p in enumerate(P) if p.startswith('CHAPITRE I.'))
body_start = next(i for i, p in enumerate(P) if i > first + 3 and p.startswith('CHAPITRE I.'))
print('toc at', first, 'body at', body_start, len(P))
heads = [(i, int(rom_pieces(CHH.match(p).group(1))), CHH.match(p).group(2)) for i, p in enumerate(P) if i >= body_start and CHH.match(p)]
print([(h[1]) for h in heads])
# front matter between the title and chapter I
D = om.B / 'vie-interieure-de-la-sainte-vierge'
SUBH = re.compile(r'^(R[ÉE]FLEXIONS PRATIQUES.*|EXPLICATION DU MAGNIFICAT|PRATIQUES DE M\. OLIER.*|[IVX]{1,4})$')
def md(title, ps):
    out = []
    for p in ps:
        if re.fullmatch(r'[IVX]{1,4}', p):
            out.append(f'## {p}')
        elif SUBH.match(p) and len(p) < 120:
            out.append('## ' + p[0] + p[1:].lower())
        else:
            out.append(p)
    return out
res = []
front_end = heads[0][0]
fm = next(i for i, p in enumerate(P) if p.startswith('APPROBATION') and i > first)
fm = [i for i, p in enumerate(P) if p in ('APPROBATION', 'AVERTISSEMENT', 'AVANT-PROPOS', 'DÉCLARATION DE L’ÉDITEUR', "DÉCLARATION DE L'ÉDITEUR")]
body_front = P[next((i for i in range(body_start - 1, 0, -1) if P[i].startswith('APPROBATION') and i > first + 40), body_start - 20):front_end]
# simpler: everything between the 2nd 'VIE INTÉRIEURE...' title and chapter I
t0 = max(i for i, p in enumerate(P[:front_end]) if p.startswith('VIE INTÉRIEURE'))
ap = [i for i, p in enumerate(P[:front_end]) if p.startswith('APPROBATION')]
print('approbation idx', ap)
a0 = ap[-1] if len(ap) > 1 else t0 + 1
fr = md('x', [p for p in P[a0:front_end] if not p.startswith('VIE INTÉRIEURE DE LA TRÈS-SAINTE VIERGE')])
res.append(('avant-propos', 'Approbation, avertissement et avant-propos', write_md(D / 'fr-FR/avant-propos.md', 'Approbation, avertissement et avant-propos', fr)))
for k, (i, n, tt) in enumerate(heads):
    j = heads[k + 1][0] if k + 1 < len(heads) else len(P)
    tt = re.sub(r'\s+[iI]$', '', tt.strip(' .')).replace('VERRE', 'VERBE')
    low = tt.lower()
    low = low[:1].upper() + low[1:]
    for w, W in (('marie', 'Marie'), ('vierge', 'Vierge'), ('joseph', 'Joseph'), ('jésus-christ', 'Jésus-Christ'), ('jésus', 'Jésus'), ('dieu', 'Dieu'), ('verbe', 'Verbe'), ('cana', 'Cana'), ('jean', 'Jean'), ('notre-seigneur', 'Notre-Seigneur'), ('eucharistie', 'Eucharistie'), ('église', 'Église'), ('pentecôte', 'Pentecôte'), ('ascension', 'Ascension'), ('assomption', 'Assomption'), ('calvaire', 'Calvaire'), ('résurrection', 'Résurrection')):
        low = re.sub(r'\b' + w + r'\b', W, low)
    title = f'Chapitre {n}. {low}' if tt else f'Chapitre {n}'
    cid = f'chapitre-{n:02d}'
    res.append((cid, title, write_md(D / 'fr-FR' / f'{cid}.md', title, md(title, P[i + 1:j]))))
for r in res: print(r)
name = om.tr('Vie intérieure de la très sainte Vierge', 'The Interior Life of the Most Holy Virgin', 'Vida interior da santíssima Virgem')
desc = om.tr('Ouvrage recueilli des écrits de M. Olier : la vie de Marie, de sa prédestination à son Assomption, mystère par mystère, avec les pratiques de M. Olier et des réflexions pratiques.', 'A work gathered from Olier’s writings: the life of Mary from her predestination to her Assumption, mystery by mystery, with M. Olier’s practices and practical reflections.', 'Obra reunida dos escritos de Olier: a vida de Maria, da predestinação à Assunção, mistério por mistério, com as práticas de Olier e reflexões práticas.')
src = [{'language': 'fr-FR', 'url': 'http://jesusmarie.free.fr/olier_vie_de_la_tres_sainte_vierge_marie.html', 'edition': 'Vie intérieure de la très sainte Vierge, ouvrage recueilli des écrits de M. Olier (compiled by Faillon), one-volume edition; retyped HTML on jesusmarie.free.fr from the Abbaye Saint-Benoît de Port-Valais digitisation.', 'description': 'HTML text converted to markdown (chapters, numbered sections as H2). The editor’s footnotes, if any, are not carried over.', 'tier': 'A', 'tierEvidence': 'Olier died in 1657; the compilation dates from 1875 (Faillon d. 1870).'}]
print(make(D, 'olier-vie-interieure-vierge', 'olier/vie-interieure-de-la-sainte-vierge', name, om.AUTH, desc, 1650, {'fr-FR': {'editor': 'Étienne-Michel Faillon', 'year': 1875}}, src, order=['avant-propos', 'chapitre']))
