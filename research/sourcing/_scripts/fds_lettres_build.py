import re, sys, os, shutil
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_common import *
from fds_lettres_parse import parse
WEB = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/web'
F = [1,121,271,444,653,873,1086,1307,1541,1744,1965]
S = {3: 692, 4: 589, 11: 6049}
ANN = ['XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']
SMALL = {'un','une','ses','mon','ma','mes','son','sa','à','a','de','du','des','la','le','les','et','au','aux','en','sur','par','pour','d','l'}
def tc(s):
    s = re.sub(r'\s+', ' ', s.replace('\xa0', ' ')).strip().rstrip('.')
    out = []
    for i, w in enumerate(s.lower().split(' ')):
        m = re.match(r"^([dl]['’])(.*)$", w)
        if m:
            out.append(m.group(1) + m.group(2).capitalize())
        elif w in SMALL and i:
            out.append(w)
        else:
            out.append(w.capitalize() if '-' not in w else '-'.join(x.capitalize() for x in w.split('-')))
    return ' '.join(out)[:1].upper() + ' '.join(out)[1:]
def paras(lines):
    ps, cur = [], []
    for l in lines:
        l = l.replace('\xa0', ' ')
        if not l.strip():
            if cur: ps.append(' '.join(cur)); cur = []
            continue
        if l[0] == ' ' and cur:
            ps.append(' '.join(cur)); cur = []
        cur.append(l.strip())
    if cur: ps.append(' '.join(cur))
    return [re.sub(r'\s+', ' ', p).strip() for p in ps if p.strip()]
def build(t):
    letters = parse(f'{WEB}/francois_de_sales_lettres_tome_{t}.html.txt', F[t-1], S.get(t), 2099 if t == 11 else 20)
    book = f'lettres-{ANN[t-1].lower()}'
    tot = 0; toc = []; groups = {}
    years = []
    for k, L in enumerate(letters):
        body = paras(L['lines'])
        while body and len(body[-1]) < 3: body.pop()
        if not body: continue
        addr = re.sub(r'^A ', 'À ', tc(body[0])); rest = body[1:]
        if rest: rest[0] = '*' + rest[0] + '*'
        cid = f"lettre-{L['n']:04d}" + (('-' + L['sfx']) if L['sfx'] else '')
        if any(c['id'] == cid for g in toc for c in g['children']):
            cid += f'-{k}'
        title = f"Lettre {L['num']}{(' ' + L['sfx']) if L['sfx'] else ''}. {addr}"
        tot += write_chapter(book, 'fr-FR', cid, title, rest)
        yl = L['year'] or 'Lettres'
        ym = re.search(r'1[56]\d\d', yl)
        ylab = ('Années antérieures à ' + ym.group(0)) if 'ANTERIEURES' in yl.upper() and ym else (('Année ' + ym.group(0) + (' (suite)' if 'suite' in yl.lower() else '')) if ym else tc(yl))
        years += re.findall(r'1[56]\d\d', L['year'] or '')
        if not toc or toc[-1]['title']['fr-FR'] != ylab:
            toc.append({'id': f'annee-{len(toc)+1:02d}', 'title': {'fr-FR': ylab}, 'children': []})
        toc[-1]['children'].append(leaf(cid, fr_FR=title))
    yr = f"{min(years)}-{max(years)}" if years else ''
    ann = ANN[t-1]
    write_book(book, f'sales-lettres-{ann.lower()}',
      {'fr-FR': f'Lettres de saint François de Sales, tome {ann}', 'en-US': f'Letters of St. Francis de Sales, vol. {ann}', 'pt-BR': f'Cartas de São Francisco de Sales, tomo {ann}'},
      {'fr-FR': f'Les lettres de saint François de Sales du tome {ann} de l’édition d’Annecy ({yr}), une lettre par chapitre, groupées par année : numéro, destinataire, résumé et date de l’édition critique, puis le texte en orthographe d’époque.',
       'en-US': f'The letters of St. Francis de Sales in volume {ann} of the Annecy edition ({yr}), one letter per chapter and grouped by year: the edition’s number, addressee, summary and date, then the text in period spelling.',
       'pt-BR': f'As cartas de São Francisco de Sales do tomo {ann} da edição de Annecy ({yr}).'},
      yr.split('-')[0] + '-' + yr.split('-')[-1] if yr else '', ['fr-FR'], {'fr-FR': {'editor': 'Religieuses de la Visitation d’Annecy', 'year': 1900 + (t - 1) * 2 if t < 12 else 1923}},
      [{'language': 'fr-FR', 'url': f'http://jesusmarie.free.fr/francois_de_sales_lettres_tome_{t}.html', 'edition': f'Œuvres de saint François de Sales, édition d’Annecy, tome {ann} (Lettres), Annecy: J. Niérat, 1900-1923; digital transcription in original spelling by JesusMarie.com.', 'description': 'The editors’ letter numbers, addressee headings, summaries and dates are kept; footnotes, variants, the glossary, the indexes and the appendix of letters addressed to Francis are not included.', 'tier': 'A', 'tierEvidence': 'Francis died in 1622; the Annecy edition appeared in 1900-1923, before 1930. The JesusMarie transcription is of his own text with the edition’s headings.'}],
      toc)
    return tot, len(letters)
if __name__ == '__main__':
    for t in map(int, sys.argv[1:]):
        print(t, build(t))
