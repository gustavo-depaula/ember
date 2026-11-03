import re, gue_dg as g, gue_build as b
HY = [(r'\bJésusChrist', 'Jésus-Christ'), (r'\b(elle|lui|eux|elles|soi|moi|toi|nous|vous|celui|celle|ceux|celles)(même|mêmes)\b', r'\1-\2'),
      (r'\b(est|n’est|N’est|Est|peut|Peut|a|A|fut|sera|serait|doit|aurait|avait|était|sont)(ce|il|elle|on|ils|elles)\b(?= ?[?])', r'\1-\2'),
      (r'\bpeutêtre\b', 'peut-être'), (r'\bPeutêtre\b', 'Peut-être'), (r'\b(est|n’est|N’est)(ce)\b', r'\1-\2'),
      (r'\bpuisqu’ilest\b', 'puisqu’il est')]
import gue_merge as mg
mg.setup()
AT = []
for f in ('ia/x-delamonarchiepon00gu.txt', 'ia2/dfensedeleglis00gu.txt', 'ia2/deladfinitionde00gugoog.txt'):
    AT += mg.prep_archive(open(b.ROOT + 'research/sourcing/gueranger/' + f).read())
KEYS, IDX = mg.build_index(AT)
LOG = []
def fh(t): return b.fixhy(mg.merge_para(t, AT, KEYS, IDX, LOG))
def prep(o, n, drop=0):
    o = [(k, fh(t)) for k, t in o[drop:]]
    o = [('h2', t) if re.fullmatch(r'[IVX]+\.?|APPENDICES?|NOTIONS PRÉLIMINAIRES', t) else (k, t) for k, t in o]
    return o, {a: fh(c) for a, c in n.items()}
ORD = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième', 'Sixième', 'Septième', 'Huitième', 'Neuvième']
ch, toc, raw = {}, [], []
def add(cid, t, o, n, sec=None):
    o, n = prep(o, n)
    ch[cid] = b.chapter_md(t, o, n); toc.append((cid, t, sec))
P = g.find('De la monarchie pontificale – Préface')[0]; o, n = g.parse(P); raw.append((g.title(P), o))
add('bref-pie-ix', 'Bref de N. S. P. le pape Pie IX (12 mars 1870)', o[6:22], n)
add('preface', 'Préface', o[24:32], n)
add('introduction', 'Introduction', o[33:], n)
for i, w in enumerate(ORD, 1):
    pre = 'De la monarchie pontificale – %s préjugé' % w
    P = g.find(pre)[0]; o, n = g.parse(P); raw.append((g.title(P), o))
    add('prejuge-%d' % i, '%s préjugé. %s' % (w, o[1][1].rstrip('.')), o[2:], n)
P = g.find('De la monarchie pontificale – L’infaill')[0]; o, n = g.parse(P); raw.append((g.title(P), o))
add('infaillibilite-dogme', 'L’infaillibilité personnelle du pontife romain peut-elle être l’objet d’une définition doctrinale qui en fasse un dogme de foi catholique ?', o[1:], n)
P = g.find('De la monarchie pontificale – Appendices')[0]; o, n = g.parse(P); raw.append((g.title(P), o))
o = [('h2', t) if re.match(r'^[IVX]+\. [A-ZÉ]', t) and len(t) < 140 else (k, t) for k, t in o[1:]]
add('appendices', 'Appendices', o, n)
OP = [('Défense de l’Église romaine contre', 'gratry-1', 'Défense de l’Église romaine contre les accusations du R. P. Gratry (première lettre)', 2),
      ('Deuxième défense', 'gratry-2', 'Deuxième défense de l’Église romaine contre les accusations du R. P. Gratry', 2),
      ('Troisième défense', 'gratry-3', 'Troisième défense de l’Église romaine contre les accusations du R. P. Gratry', 2),
      ('De la définition de l’infaillibilité papale', 'definition-infaillibilite', 'De la définition de l’infaillibilité papale, à propos de la lettre de Mgr d’Orléans à Mgr de Malines', 1),
      ('Réponse aux dernières objections', 'reponse-objections', 'Réponses aux dernières objections contre la définition de l’infaillibilité du pontife romain', 1)]
for pre, cid, t, dr in OP:
    P = g.find(pre)[0]; o, n = g.parse(P); raw.append((g.title(P), o))
    if cid == 'gratry-3': o = o[:1] + o[2:]  # keep section numeral 'I' (drop the letter number)
    add(cid, t, o[dr if cid != 'gratry-3' else 1:], n, 'opuscula')
tocn = []; opus = []
for cid, t, sec in toc:
    (opus if sec else tocn).append({'id': cid, 'title': {'fr-FR': t}})
tocn.append({'id': 'opuscula', 'title': {'fr-FR': 'Opuscules de 1870', 'en-US': 'Pamphlets of 1870'}, 'children': opus})
raw_txt = '\n\n---\n\n'.join('# %s\n\n%s' % (t, '\n\n'.join(x for _, x in o)) for t, o in raw)
d = b.book('gueranger-monarchie-pontificale', 'monarchie-pontificale',
  {'fr-FR': 'De la monarchie pontificale', 'en-US': 'On the Pontifical Monarchy', 'pt-BR': 'Da monarquia pontifical'},
  {'fr-FR': 'Réponse de Dom Guéranger (1870), à la veille du concile du Vatican, au livre de Mgr Maret, évêque de Sura, Du Concile général et de la paix religieuse : neuf préjugés contre ce livre, puis l’étude de l’infaillibilité personnelle du pontife romain comme dogme, avec le bref de Pie IX et des appendices. En opuscules : les trois Défenses de l’Église romaine contre le P. Gratry, et les deux écrits sur la définition de l’infaillibilité (réponse à Mgr Dupanloup, réponse aux dernières objections). Deuxième édition, Paris, Palmé, 1870.',
   'en-US': 'Dom Guéranger’s reply (1870), on the eve of the Vatican Council, to Mgr Maret’s book Du Concile général et de la paix religieuse: nine prejudices against that book, then a study of the personal infallibility of the Roman pontiff as a dogma, with the brief of Pius IX and appendices. As pamphlets: the three Defences of the Roman Church against Fr Gratry and the two writings on the definition of infallibility (reply to Mgr Dupanloup, reply to the last objections). Second edition, Paris, Palmé, 1870.',
   'pt-BR': 'Resposta de Dom Guéranger (1870), às vésperas do Concílio do Vaticano, ao livro de Mons. Maret, Du Concile général et de la paix religieuse: nove preconceitos contra esse livro, depois o estudo da infalibilidade pessoal do pontífice romano como dogma, com o breve de Pio IX e apêndices. Como opúsculos: as três Defesas da Igreja romana contra o P. Gratry e os dois escritos sobre a definição da infalibilidade (resposta a Mons. Dupanloup, resposta às últimas objeções). Segunda edição, Paris, Palmé, 1870.'},
  '1870', ['fr-FR'], {'fr-FR': {'editor': 'Palmé (Paris)', 'year': 1870}},
  [b.src('fr-FR', b.DG + '?cat=De la monarchie pontificale', 'De la monarchie pontificale, 2nd ed., Paris, Palmé, 1870, and the Gratry and infallibility pamphlets of 1870 (domgueranger.net HTML transcription of the OCR; compound hyphens lost in the transcription are restored for Jésus-Christ, -même, -ce, peut-être)', 'Checked in size against archive.org delamonarchiepon00gu, dfensedeleglis00gu, deladfinitionde00gugoog. The site’s 2.8k-word presentation pieces about the book (L’infaillibilité du pape à partir des réflexions…) are not included.')],
  tocn)
print(len(LOG), 'OCR votes')
open(b.ROOT + 'research/sourcing/gueranger/mon_votes.txt', 'w').write('\n'.join('%s -> %s' % x for x in LOG))
b.write_book('monarchie-pontificale', d, {'fr-FR': ch}, {'monarchie-pontificale': ('french', raw_txt)})
