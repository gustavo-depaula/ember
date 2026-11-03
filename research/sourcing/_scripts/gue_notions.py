import re, gue_dg as g, gue_build as b, gue_en as en
U = [('vie-religieuse', 'Essence de la vie religieuse', 'Essence of the religious life', 14),
     ('vie-monastique', 'Essence de la vie monastique', 'Essence of the monastic life', 30),
     ('regle', 'De l’excellence et de l’observation de la Règle', 'On the excellence and observance of the Rule', 88),
     ('fondement', 'Du fondement essentiel de la vie religieuse', 'On the essential foundation of the religious life', 100),
     ('foi', 'De la foi', 'On faith', 114), ('esperance', 'De l’espérance', 'On hope', 124),
     ('amour-de-dieu', 'De l’amour de Dieu', 'On the love of God', 135),
     ('amour-de-jesus-christ', 'De l’amour de Notre Seigneur Jésus-Christ', 'On the love of our Lord Jesus Christ', 145),
     ('perfection', 'De la perfection', 'On perfection', 152),
     ('imitation', 'De l’imitation de Notre Seigneur Jésus-Christ', 'On the imitation of our Lord Jesus Christ', 162),
     ('conseils-evangeliques', 'Des conseils évangéliques', 'On the evangelical counsels', 172)]
o, n = g.parse(g.find('Notions sur la vie religieuse')[0])
def strip_it(t):
    m = re.fullmatch(r'\*([^*]+)\*', t); return m.group(1).strip() if m else t
fr = {}
pre = [('p', strip_it(t)) for k, t in o[10:11]]
pre = [('p', 'Plusieurs maisons religieuses nous ont prié de leur communiquer les instructions que Dom Guéranger nous a laissées pour la formation des novices. Nous le faisons volontiers, persuadé que ces quelques pages pourront être étudiées avec fruit.')] if False else [('p', strip_it(o[10][1])), ('p', 'Fr. Charles Couturier, abbé de Solesmes'), ('p', 'Solesmes, en la fête de l’Ascension, 14 mai 1885')]
fr['preface'] = b.chapter_md('Préface de l’édition française', pre, n)
for k, (cid, ft, et, fi) in enumerate(U):
    end = U[k + 1][3] if k + 1 < len(U) else len(o)
    body = o[fi + 1:end] if k else o[15:end]
    pp = []
    for kk, t in body:
        if re.fullmatch(r'\*[^*]+\*', t): pp.append(('h2', strip_it(t)))
        else: pp.append((kk, t))
    fr[cid] = b.chapter_md(ft, pp, n)
lines = open(b.ROOT + 'research/sourcing/gueranger/ia/x-religiousmonasti00gura.txt').read().replace('\x0c', '').split('\n')
pos = [i for i, l in enumerate(lines) if re.fullmatch(r'CHAPTER [IVXL]+T?\.?', l.strip()) and i > 300]
assert len(pos) == 11, pos
ps = next(i for i, l in enumerate(lines) if l.strip() == 'PREFACE OF THE TRANSLATOR')
pf = next(i for i, l in enumerate(lines) if l.strip() == 'PREFACE TO THE FRENCH EDITION')
enc = {}
fp = en.paras(lines[pf + 1:pos[0] - 4])
tp = en.paras(lines[ps + 1:pf])
enc['preface'] = b.chapter_md('Preface to the French edition', [('p', p) for p in fp], {}, merge=False)
enc['preface'] = enc['preface'].replace('# Preface to the French edition', '# Preface to the French edition', 1)
for k, (cid, ft, et, fi) in enumerate(U):
    end = pos[k + 1] if k + 1 < len(pos) else len(lines)
    pp = en.paras(lines[pos[k] + 1:end])
    while pp and (pp[0].isupper() or len(pp[0]) < 4): pp = pp[1:]
    enc[cid] = b.chapter_md(et, [('p', p) for p in pp], {}, merge=False)
enc['preface'] = b.chapter_md('Preface to the French edition', [('h2', 'Preface of the translator')] + [('p', p) for p in tp] + [('h2', 'Preface to the French edition')] + [('p', p) for p in fp], {}, merge=False)
toc = [{'id': 'preface', 'title': {'fr-FR': 'Préface de l’édition française', 'en-US': 'Prefaces'}}] + [{'id': c, 'title': {'fr-FR': f, 'en-US': e}} for c, f, e, _ in U]
d = b.book('gueranger-notions-vie-religieuse', 'notions-vie-religieuse',
 {'fr-FR': 'Notions sur la vie religieuse et monastique', 'en-US': 'Religious and Monastic Life Explained', 'pt-BR': 'Noções sobre a vida religiosa e monástica'},
 {'fr-FR': 'Instructions de Dom Guéranger pour la formation des novices de Solesmes, publiées en 1885 par Dom Charles Couturier : essence de la vie religieuse et monastique, excellence de la Règle, foi, espérance, amour de Dieu et de Notre Seigneur, perfection, imitation de Jésus-Christ, conseils évangéliques. Le chapitre sur l’essence de la vie religieuse n’a pas de titre propre dans l’édition ; son titre vient du début du texte.',
  'en-US': 'Dom Guéranger’s instructions for the training of the novices of Solesmes, published in 1885 by Dom Charles Couturier: the essence of the religious and monastic life, the excellence of the Rule, faith, hope, the love of God and of our Lord, perfection, the imitation of Jesus Christ and the evangelical counsels. Authorised translation from the French, 1908.',
  'pt-BR': 'Instruções de Dom Guéranger para a formação dos noviços de Solesmes, publicadas em 1885 por Dom Charles Couturier: essência da vida religiosa e monástica, excelência da Regra, fé, esperança, amor de Deus e de Nosso Senhor, perfeição, imitação de Jesus Cristo e conselhos evangélicos.'},
 '1885', ['fr-FR', 'en-US'], {'fr-FR': {'editor': 'Dom Charles Couturier (Solesmes, Imprimerie Saint-Pierre)', 'year': 1885}, 'en-US': {'translator': 'Anonymous, authorised version (St. Louis: Herder)', 'year': 1908}},
 [b.src('fr-FR', b.DG + '?s=Notions+sur+la+vie+religieuse', 'Notions sur la vie religieuse et monastique, Solesmes, Imprimerie Saint-Pierre, 1885 (domgueranger.net HTML transcription)', 'Instructions to novices edited after Guéranger’s death.', ev='Guéranger died 1875; printed 1885.'),
  b.src('en-US', 'https://archive.org/details/religiousmonasti00gura', 'Religious and Monastic Life Explained, authorised version from the French, St. Louis, B. Herder, 1908 (archive.org OCR text, cleaned)', 'English chapters I and II correspond to the French opening chapter and chapter I; the translator’s preface is added to the Preface chapter. Page-foot notes, where any, were not separated by the OCR.', ev='Printed 1908.')],
 toc)
b.write_book('notions-vie-religieuse', d, {'fr-FR': fr, 'en-US': enc}, {'notions': ('french', '\n\n'.join(t for _, t in o))})
