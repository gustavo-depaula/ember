import re, gue_dg as g, gue_build as b
ORD = {1:'Première',2:'Deuxième',3:'Troisième',4:'Quatrième',5:'Cinquième',6:'Sixième',7:'Septième',8:'Huitième',9:'Neuvième',10:'Dixième',11:'Onzième',12:'Douzième',13:'Treizième',14:'Quatorzième',15:'Quinzième',16:'Seizième',17:'Dix-septième',18:'Dix-huitième',19:'Dix-neuvième',20:'Vingtième',21:'Vingt et unième',22:'Vingt-deuxième',23:'Vingt-troisième',24:'Vingt-quatrième',25:'Vingt-cinquième',26:'Vingt-sixième',27:'Vingt-septième',28:'Vingt-huitième',29:'Vingt-neuvième',30:'Trentième',31:'Trente et unième',32:'Trente-deuxième'}
def num(p):
    t = g.title(p); m = re.search(r'(\d+)(?:ème|ère|e)\s+conf', t); return int(m.group(1)) if m else 1
def decap(t):
    m = re.match(r"^([A-ZÀ-Ý]{1,3}[’'] ?)?([A-ZÀ-Ý]{2,})(?=[\s,;:.]|$)", t)
    if not m: return t
    pre, w = m.group(1), m.group(2)
    if pre: return pre.replace(' ', '') + w.lower() + t[m.end():]
    return w[:1] + w[1:].lower() + t[m.end():]
def strip_it(t):
    m = re.fullmatch(r'\*([^*]+)\*', t.strip()); return m.group(1).strip() if m else t
ps = sorted(g.find('Conférences sur la vie chrétienne'), key=num)
ch, toc, raw = {}, [], []
for p in ps:
    N = num(p); o, n = g.parse(p); raw.append((g.title(p), o))
    if N == 1:
        pre = [('p', t) for k, t in o[14:18]]
        ch['avant-propos'] = b.chapter_md('Avant-propos', [(k, decap(t)) for k, t in pre], n); toc.append(('avant-propos', 'Avant-propos'))
        body = o[22:]; summ = o[22][1]
    else:
        body = o[2:]; summ = o[2][1]
    pp = [('p', strip_it(summ))] + [('p', decap(b.fixhy(t))) for k, t in body[1:]]
    cid = 'conference-%02d' % N
    t = '%s conférence' % ORD[N]
    ch[cid] = b.chapter_md(t, pp, n); toc.append((cid, t))
d = b.book('gueranger-conferences-vie-chretienne', 'conferences-vie-chretienne',
 {'fr-FR': 'Conférences sur la vie chrétienne', 'en-US': 'Conferences on the Christian Life', 'pt-BR': 'Conferências sobre a vida cristã'},
 {'fr-FR': 'Conférences données par Dom Guéranger au chapitre de Saint-Pierre de Solesmes entre octobre 1872 et mai 1874, d’après les notes recueillies par plusieurs moines : théologie dogmatique, morale, mystique et ascétique, vies purgative, illuminative et unitive, méditation. Vingt-neuf conférences numérotées de 1 à 32 : les conférences 19 et 31 manquent à la source. Notes de conférences, non la rédaction définitive de l’auteur.',
  'en-US': 'Conferences given by Dom Guéranger to the chapter of Saint-Pierre de Solesmes between October 1872 and May 1874, from notes taken by several monks: dogmatic, moral, mystical and ascetical theology, the purgative, illuminative and unitive ways, meditation. Thirty conferences numbered 1 to 32 (nos. 19 and 31 are missing from the source). Conference notes, not the author’s finished prose.',
  'pt-BR': 'Conferências dadas por Dom Guéranger ao capítulo de Saint-Pierre de Solesmes entre outubro de 1872 e maio de 1874, a partir de anotações de vários monges: teologia dogmática, moral, mística e ascética, vias purgativa, iluminativa e unitiva, meditação. Trinta conferências numeradas de 1 a 32 (faltam as de números 19 e 31 na fonte). Anotações de conferências, não a redação definitiva do autor.'},
 '1874', ['fr-FR'], {'fr-FR': {'editor': 'Moines de Solesmes (from notes)', 'year': 1874}},
 [b.src('fr-FR', b.DG + '?cat=Conférences sur la vie chrétienne', 'Conférences sur la vie chrétienne prononcées dans le chapitre de S. Pierre de Solesmes (octobre 1872 – mai 1874), d’après les notes recueillies par plusieurs moines (domgueranger.net HTML transcription)', 'Conferences 19 and 31 are not on the site. The printing year of the source edition is not stated; the text is a 19th-century record of the conferences.', ev='Guéranger died 1875; text recorded 1872-74.')],
 b.toc_of(toc))
b.write_book('conferences-vie-chretienne', d, {'fr-FR': ch}, {'conferences': ('french', '\n\n---\n\n'.join('# %s\n\n%s' % (t, '\n\n'.join(x for _, x in o)) for t, o in raw))})
