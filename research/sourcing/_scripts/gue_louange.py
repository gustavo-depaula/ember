import re, gue_dg as g, gue_build as b
o, n = g.parse(g.find('L’Église ou la société')[0])
def lead(t):
    m = re.match(r"^((?:[A-ZÀ-Ý][A-ZÀ-Ý’'-]+ )+)(?=[a-zà-ÿ])", t)
    if not m: return t
    run = m.group(1)
    return ' '.join(w[:1] + w[1:].lower() for w in run.split(' ') if w) + ' ' + t[m.end():] if False else re.sub(r"[A-ZÀ-Ý]+", lambda x: x.group(0)[:1] + x.group(0)[1:].lower(), run) + t[m.end():]
U = [('preface', 'Préface', 26, 31), ('i', 'I', 35, 47), ('ii', 'II', 48, 56), ('iii', 'III', 57, 134)]
ch, toc = {}, []
for cid, t, a, e in U:
    pp = [('h2', x) if re.fullmatch(r'(JANVIER|FEVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOUT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DÉCEMBRE)', x) else ('p', lead(x)) for k, x in o[a:e]]
    pp = [(k, {'Fevrier': 'Février', 'Aout': 'Août'}.get(x.capitalize(), x.capitalize()) if k == 'h2' else x) for k, x in pp]
    ch[cid] = b.chapter_md(t, pp, n); toc.append((cid, t))
d = b.book('gueranger-louange-divine', 'louange-divine',
 {'fr-FR': 'L’Église ou la société de la louange divine', 'en-US': 'The Church, or the Society of Divine Praise', 'pt-BR': 'A Igreja ou a sociedade do louvor divino'},
 {'fr-FR': 'Opuscule dicté par Dom Guéranger quelques semaines avant sa mort (1875) et publié par ses fils : conseils aux fidèles qui veulent s’associer à la louange que l’Église rend à Dieu, avec le calendrier des fêtes de l’association. La lettre d’approbation de Mgr de Marseille et la seconde partie, Le prêtre et l’ordre de saint Benoît de Cécile Bruyère, ne sont pas de Dom Guéranger et sont omises.',
  'en-US': 'A short work dictated by Dom Guéranger a few weeks before his death (1875) and published by his sons: counsels for the faithful who wish to join in the praise the Church renders to God, with the calendar of feasts of the association. The approving letter of the bishop of Marseille and the second part, Le prêtre et l’ordre de saint Benoît by Cécile Bruyère, are not Guéranger’s and are left out.',
  'pt-BR': 'Opúsculo ditado por Dom Guéranger algumas semanas antes de morrer (1875) e publicado por seus filhos: conselhos aos fiéis que desejam associar-se ao louvor que a Igreja rende a Deus, com o calendário das festas da associação. A carta de aprovação do bispo de Marselha e a segunda parte, Le prêtre et l’ordre de saint Benoît, de Cécile Bruyère, não são de Dom Guéranger e foram omitidas.'},
 '1875', ['fr-FR'], {'fr-FR': {'editor': 'Moines de Solesmes (Imprimerie Saint-Pierre)', 'year': 1875}},
 [b.src('fr-FR', b.DG + 'leglise-ou-la-societe-de-la-louange-divine/', 'L’Église ou la société de la louange divine, Solesmes, Imprimerie Saint-Pierre, 1875 (domgueranger.net HTML transcription)', 'Guéranger’s part only.', ev='Guéranger died 1875; printed 1875.')],
 b.toc_of(toc))
b.write_book('louange-divine', d, {'fr-FR': ch}, {'louange-divine': ('french', '\n\n'.join(t for _, t in o))})
