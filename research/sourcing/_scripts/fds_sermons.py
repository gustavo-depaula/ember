import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_clean import clean, finish
from fds_common import *
DL = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/dl'
H = re.compile(r'^␂?\s*(SERMON|SECOND SERMON|PREMIER SERMON|TROISIÈME SERMON|AUTRE SERMON|SERMONS? [A-ZÉ]+)\b', re.I)
DATE = re.compile(r'^␂?\s*[\dilorIfrt]{1,2}\s*(er|ER)?\s*(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)|^␂?\s*(Fin|Début|Commencement|Vers|Sans date|En|Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\b', re.I)
END = re.compile(r'^␂?\s*(SERMONS REPRODUITS|TABLE DES|APPENDICE|ADDITIONS|SERMONS? —|Table des)', re.I)
MONTH = r'(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)'
def fixdate(s):
    s = re.sub(r'\s*[\(\[]\s*[\w’\'>]{0,3}\s*[\)\]]', '', s)
    s = re.sub(r'^io\b', '10', s)
    s = re.sub(r'\b[iIl](\d)\b', r'1\1', s)
    s = re.sub(r'\b(\d)[iIl]\b', r'\g<1>1', s)
    s = re.sub(r'^[iIlr](?=\s*' + MONTH + ')', '1', s)
    s = re.sub(r'\b(\d{1,2})(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)', r'\1 \2', s)
    return s
CAPS = ['pentecôte','noël','pâques','assomption','toussaint','trinité','église','vierge','dieu','jésus-christ','sacrement','purification','annonciation','présentation','nativité','ascension','épiphanie','transfiguration','croix','chandeleur','rameaux','carême','cendres','marie','saint-sacrement','visitation','vendredi saint','jeudi saint','conception','immaculée']
def sent(s):
    s = re.sub(r'[«♦•]', '', s)
    s = re.sub(r'(\s+\S{0,3}\))+\s*$', '', s)
    s = re.sub(r'\s+', ' ', s).strip().rstrip('.,;')
    if s.isupper() or s[:6].isupper():
        s = s[:1] + s[1:].lower()
    s = re.sub(r'\bsermon\b', 'Sermon', s, flags=re.I) if False else s
    for w in CAPS:
        s = re.sub(r'\b' + w + r'\b', w[0].upper() + w[1:], s)
    return s[:1].upper() + s[1:]
def build(vol, t, ann, years, first_n=1):
    ps = finish(clean(f'{DL}/t{t}l.txt'))
    heads = [i for i, p in enumerate(ps) if H.match(p) and len(p) < 140 and i > 40]
    # drop headings that are just a continuation of a previous heading block (within 3 paras)
    keep = []
    for i in heads:
        if keep and i - keep[-1] < 4:
            continue
        keep.append(i)
    endk = next((k for k in range(keep[-1] + 20, len(ps)) if END.match(ps[k])), len(ps))
    BK = f'sermons-{ann.lower()}'
    tot = 0; toc = []
    for n, i in enumerate(keep):
        j = keep[n + 1] if n + 1 < len(keep) else endk
        t_parts = [ps[i].lstrip('␂')]
        k = i + 1
        while k < j and k < i + 4 and ps[k].startswith('␂') and len(ps[k]) < 90:
            t_parts.append(ps[k].lstrip('␂'))
            dated = bool(DATE.match(ps[k]))
            k += 1
            if dated:
                break
        title = sent(' '.join(fixdate(x) if DATE.match('␂' + x) else x for x in t_parts))
        title = re.sub(r'^Sermon', 'Sermon', title)
        body = [p.lstrip('␂') for p in ps[k:j]]
        body = trim_tail(body) if False else body
        cid = f'sermon-{n + 1:03d}'
        tot += write_chapter(BK, 'fr-FR', cid, title, body)
        toc.append(leaf(cid, fr_FR=title))
    ed = {'VII': 'I', 'VIII': 'II', 'IX': 'III', 'X': 'IV'}[ann]
    write_book(BK, f'sales-sermons-{ann.lower()}',
      {'fr-FR': f'Sermons de saint François de Sales, tome {ann}', 'en-US': f'Sermons of St. Francis de Sales, vol. {ann}', 'pt-BR': f'Sermões de São Francisco de Sales, tomo {ann}'},
      {'fr-FR': f'Les sermons du tome {ann} de l’édition d’Annecy (vol. {ed} des Sermons, {years}), un sermon par chapitre, en orthographe d’époque.',
       'en-US': f'The sermons in volume {ann} of the Annecy edition (Sermons, vol. {ed}; {years}), one sermon per chapter, in period spelling.',
       'pt-BR': f'Os sermões do tomo {ann} da edição de Annecy ({years}).'},
      years, ['fr-FR'], {'fr-FR': {'editor': 'Religieuses de la Visitation d’Annecy', 'year': 1896 + (int(t) - 7) }},
      [FR_SRC('Francis’s text in the original 17th-century spelling, extracted from the PDF text layer (layout mode). Marginal references, variants and footnotes, the editors’ introductions and tables are not included. Sermon titles come from the headings and dates printed above each sermon.', f't. {ann}: Sermons, 1896-1898 (file {t})')], toc)
    return tot, len(keep)
if __name__ == '__main__':
    cfg = {'07': ('VII', '1593-1602'), '08': ('VIII', ''), '09': ('IX', ''), '10': ('X', '')}
    for t in sys.argv[1:]:
        ann, yrs = cfg[t]
        print(t, build(t, t, ann, yrs or '1593-1622'))
