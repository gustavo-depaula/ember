import re, gue_dg as g, gue_build as b, gue_series as s
txt = open(b.ROOT + 'research/sourcing/gueranger/ia2/natural_philo.txt').read()
parts = re.split(r"\n(?=L'Univers, \d+ \w+ 18\d\d\.)", txt)
assert len(parts) == 7, len(parts)
ch, toc, raw = {}, [], []
def paras_of(seg):
    out = []
    for bl in re.split(r'\n\s*\n', seg):
        t = re.sub(r'\s+', ' ', bl.replace('\n', ' ')).strip()
        if not t: continue
        if out and not re.search(r'[.!?»:;…)\]]$', out[-1]) and t[:1].islower():
            out[-1] += ' ' + t
        elif out and out[-1].endswith('-') and t[:1].islower():
            out[-1] = out[-1][:-1] + t
        else: out.append(t)
    return out
fixes = [(r"\bl'", "l’"), (r"\bd'", "d’"), (r"\bn'", "n’"), (r"\bqu'", "qu’"), (r"\bs'", "s’"), (r"\bj'", "j’"), (r"\bc'", "c’"), (r"\bm'", "m’"), (r"\bt'", "t’"), (r"\bL'", "L’"), (r"\bD'", "D’"), (r"\bQu'", "Qu’"), (r"\bN'", "N’"), (r"\bJ'", "J’"), (r"\bC'", "C’"), (r"\bS'", "S’"), (r"\bM'", "M’")]
def fx(t):
    for a, c in fixes: t = re.sub(a, c, t)
    return t.replace('Eglise', 'Église')
for i, seg in enumerate(parts, 1):
    raw.append(('Du naturalisme dans la philosophie, article %d' % i, seg))
    ps = paras_of(seg)
    ps = [p for p in ps if not re.match(r"^(L'Univers, \d|Du [Nn]aturalisme (contemporain|dans la Philosophie)\.?$|\(\d+[°®e] article|\d[°®] article\.?$|D\. P\. Guéranger$)", p)]
    ps = [p for p in ps if not re.match(r"^\(\d+°? ?article\.? Voir", p) or True]
    cid = 'philosophie-%02d' % i
    t = 'Du naturalisme dans la philosophie, article %d' % i
    ch[cid] = b.chapter_md(t, [('p', fx(p)) for p in ps], {}, merge=False); toc.append((cid, t))
ps = sorted(g.find('Du Naturalisme dans l’Histoire'), key=lambda p: p['date'] + g.title(p))
ps += g.find('Du point de vue chrétien')
for i, p in enumerate(ps, 1):
    o, n = g.parse(p); raw_o = o
    if i == 1:
        o = o[11:]
    sub = ''
    if i in (8,9,10,11,12,13) and o:
        sub = o[0][1].strip('[]').strip().rstrip('.'); o = o[1:]
    cid = 'histoire-%02d' % i
    t = 'Du naturalisme dans l’histoire, article %d' % i if i <= 13 else 'Du point de vue chrétien dans l’histoire (Le Monde, 3 avril 1860)'
    if sub and i <= 13: t += '. ' + sub.rstrip('.')
    ch[cid] = b.chapter_md(t, o, n); toc.append((cid, t))
    raw.append((g.title(p), '\n\n'.join(x for _, x in raw_o)))
raw_txt = '\n\n---\n\n'.join('# %s\n\n%s' % r for r in raw)
d = b.book('gueranger-naturalisme', 'naturalisme',
  {'fr-FR': 'Essais sur le naturalisme contemporain', 'en-US': 'Essays on Contemporary Naturalism', 'pt-BR': 'Ensaios sobre o naturalismo contemporâneo'},
  {'fr-FR': 'Deux séries d’articles de L’Univers : Du naturalisme dans la philosophie (sept articles, 1857-1858) et Du naturalisme dans l’histoire (treize articles, 1858-1859), suivis de la réponse Du point de vue chrétien dans l’histoire (Le Monde, 1860). Dom Guéranger y dénonce l’oubli de l’ordre surnaturel dans la philosophie et dans l’histoire.',
   'en-US': 'Two series of articles from L’Univers: On Naturalism in Philosophy (seven articles, 1857-1858) and On Naturalism in History (thirteen articles, 1858-1859), with the reply On the Christian Point of View in History (Le Monde, 1860). Dom Guéranger denounces the forgetting of the supernatural order in philosophy and in history.',
   'pt-BR': 'Duas séries de artigos de L’Univers: Do naturalismo na filosofia (sete artigos, 1857-1858) e Do naturalismo na história (treze artigos, 1858-1859), seguidas da resposta Do ponto de vista cristão na história (Le Monde, 1860). Dom Guéranger denuncia o esquecimento da ordem sobrenatural na filosofia e na história.'},
  '1857', ['fr-FR'], {'fr-FR': {'editor': 'L’Univers (Paris)', 'year': 1859}},
  [b.src('fr-FR', 'https://archive.org/details/natural_philo_gueranger', 'Du Naturalisme dans la Philosophie, L’Univers, 27 September 1857 to 17 January 1858 (archive.org Nature_Philo_Gueranger, OCR text, cleaned)', 'Seven articles; OCR with apostrophes and the capital É normalised.'),
   b.src('fr-FR', b.DG + '?cat=Du Naturalisme dans l’Histoire', 'Du Naturalisme dans l’Histoire, L’Univers, 31 January 1858 to 3 July 1859, and Le Monde, 3 April 1860 (domgueranger.net HTML transcription)', 'Thirteen articles and the 1860 reply.')],
  b.toc_of(toc))
b.write_book('naturalisme', d, {'fr-FR': ch}, {'naturalisme': ('french', raw_txt)})
