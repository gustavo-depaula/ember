import re, sys, gue_dg as g, gue_build as b
def sent(t):
    t = t.strip().rstrip('.')
    t = t[:1] + t[1:].lower()
    for a, c in [('léon x', 'Léon X'), ('françois ler', 'François Ier'), ('françois ier', 'François Ier'), (' ier', ' Ier'), ('l’église', 'l’Église'), ('de france', 'de France'), ('l’église', 'l’Église')]: t = t.replace(a, c)
    return t
def plain(o): return '\n\n'.join(x for _, x in o)
def book_of(slug, id_, names, descs, composed, ed, srcs, toc, chs, raw):
    d = b.book(id_, slug, names, descs, composed, ['fr-FR'], {'fr-FR': ed}, srcs, b.toc_of(toc))
    b.write_book(slug, d, {'fr-FR': chs}, {slug: ('french', raw)})
def election():
    p = g.find('De l’élection')[0]; o, n = g.parse(p)
    o = [(k, b.fixhy(t)) for k, t in o]
    heads = [i for i, (k, t) in enumerate(o) if re.match(r'^CHAPITRE (PREMIER|[IVX]+)\.?\b', t) and i > 20]
    assert len(heads) == 20, len(heads)
    ch, toc = {}, []
    ch['preface'] = b.chapter_md('Préface', o[15:heads[0]], n); toc.append(('preface', 'Préface'))
    for k, i in enumerate(heads, 1):
        end = heads[k] if k < 20 else len(o)
        j = i + 1; tl = []
        m = re.match(r'^CHAPITRE (?:PREMIER|[IVX]+)\.?\s*(.*)$', o[i][1])
        if m.group(1): tl.append(m.group(1))
        while j < end and len(o[j][1]) < 140 and j < i + 4 and sum(c.isupper() for c in o[j][1]) / max(1, sum(c.isalpha() for c in o[j][1])) > 0.7:
            tl.append(o[j][1]); j += 1
        title = 'Chapitre %s. %s' % (k, sent(' '.join(tl)) if tl else '')
        title = title.rstrip('. ')
        title = re.sub(r'\[\^\d+\]', '', title)
        body = [(kk, re.sub(r'^\*|\*$', '', t) if False else t) for kk, t in o[j:end]]
        cid = '%02d' % k
        ch[cid] = b.chapter_md(title, body, n); toc.append((cid, title))
    book_of('election-eveques', 'gueranger-election-eveques',
      {'fr-FR': 'De l’élection et de la nomination des évêques', 'en-US': 'On the Election and Nomination of Bishops', 'pt-BR': 'Da eleição e da nomeação dos bispos'},
      {'fr-FR': 'Premier livre de Prosper Guéranger (1831), écrit au Mans après la Révolution de 1830 : le ministère de l’élection, le rôle du clergé et du peuple, les devoirs et les limites du prince chrétien, les investitures, les réserves, la Pragmatique Sanction, le Concordat de 1516 et leurs conséquences, avec une exhortation aux évêques de France. Les paragraphes explicatifs de Dom Delatte qui précèdent le texte sont omis.',
       'en-US': 'Prosper Guéranger’s first book (1831), written at Le Mans after the Revolution of 1830: the ministry of election, the role of clergy and people, the duties and limits of the Christian prince, investitures, reservations, the Pragmatic Sanction, the Concordat of 1516 and its consequences, with an exhortation to the bishops of France. Dom Delatte’s explanatory paragraphs that precede the text are left out.',
       'pt-BR': 'O primeiro livro de Prosper Guéranger (1831), escrito em Le Mans após a Revolução de 1830: o ministério da eleição, o papel do clero e do povo, os deveres e limites do príncipe cristão, as investiduras, as reservas, a Pragmática Sanção, a Concordata de 1516 e suas consequências, com uma exortação aos bispos da França. Os parágrafos explicativos de Dom Delatte que precedem o texto foram omitidos.'},
      '1831', {'editor': 'Au Mans (1831), as reproduced in Dom Delatte’s Dom Guéranger, abbé de Solesmes (Paris, 1910)', 'year': 1831},
      [b.src('fr-FR', b.DG + 'de-lelection-et-la-nomination-des-eveques/', 'De l’élection et de la nomination des évêques, Le Mans, 1831 (domgueranger.net HTML transcription, 271 notes)', 'Complete text of the twenty chapters as reproduced on the site; headnote paragraphs in italics omitted.')],
      toc, ch, plain(o))
def origines():
    p = g.find('Origines de l’Église romaine')[0]; o, n = g.parse(p)
    ch = {'preface': b.chapter_md('Préface', o[20:46], n), 'importance-plan': b.chapter_md('Importance des origines de l’Église romaine. Plan de l’ouvrage', o[48:], n)}
    book_of('origines-eglise-romaine', 'gueranger-origines-eglise-romaine',
      {'fr-FR': 'Origines de l’Église romaine', 'en-US': 'Origins of the Roman Church', 'pt-BR': 'Origens da Igreja romana'},
      {'fr-FR': 'La préface et le plan des Origines de l’Église romaine (1836), premier volume des Origines catholiques que Dom Guéranger projetait. Le volume lui-même n’a pas été retrouvé en texte ; seuls la préface et le plan, donnés par Dom Delatte, sont ici.',
       'en-US': 'The preface and plan of the Origines de l’Église romaine (1836), the first volume of the Origines catholiques that Dom Guéranger planned. The volume itself was not found as text; only the preface and plan, as given by Dom Delatte, are here.',
       'pt-BR': 'O prefácio e o plano das Origines de l’Église romaine (1836), primeiro volume das Origines catholiques que Dom Guéranger projetava. O volume em si não foi encontrado em texto; aqui estão apenas o prefácio e o plano, tais como os dá Dom Delatte.'},
      '1836', {'editor': 'Dom Delatte, Dom Guéranger, abbé de Solesmes (Paris, 1910)', 'year': 1836},
      [b.src('fr-FR', b.DG + 'origines-de-leglise-romaine/', 'Origines de l’Église romaine, t. 1, 1836: preface and plan (domgueranger.net HTML transcription)', 'Preface and plan only; the body of the volume was not found online.')],
      [('preface', 'Préface'), ('importance-plan', 'Importance des origines de l’Église romaine. Plan de l’ouvrage')], ch, plain(o))
def panegyrique():
    p = g.find('Le panégyrique')[0]; o, n = g.parse(p)
    body = [(k, t) for k, t in o[166:]]
    ch = {'panegyrique': b.chapter_md('Panégyrique de saint François de Sales', [('p', 'Prêché à la Visitation du Mans le 29 janvier 1832.')] + body, n)}
    book_of('panegyrique-francois-de-sales', 'gueranger-panegyrique-francois-de-sales',
      {'fr-FR': 'Panégyrique de saint François de Sales', 'en-US': 'Panegyric of St. Francis de Sales', 'pt-BR': 'Panegírico de São Francisco de Sales'},
      {'fr-FR': 'Sermon prêché par l’abbé Guéranger à la Visitation du Mans le 29 janvier 1832, avant la restauration de Solesmes. La présentation moderne du Père Matthieu Wallut, qui précède le texte sur le site, est omise.',
       'en-US': 'A sermon preached by the abbé Guéranger at the Visitation of Le Mans on 29 January 1832, before the restoration of Solesmes. The modern introduction by Fr Matthieu Wallut that precedes the text on the site is left out.',
       'pt-BR': 'Sermão pregado pelo abade Guéranger na Visitação do Mans em 29 de janeiro de 1832, antes da restauração de Solesmes. A apresentação moderna do Pe. Matthieu Wallut que precede o texto no site foi omitida.'},
      '1832', {'editor': 'Manuscript sermon, as transcribed on domgueranger.net', 'year': 1832},
      [b.src('fr-FR', b.DG + 'le-panegyrique-de-saint-francois-de-sales/', 'Panégyrique de saint François de Sales, 1832 (domgueranger.net HTML transcription)', 'Sermon text with the transcriber’s notes.')],
      [('panegyrique', 'Panégyrique de saint François de Sales')], ch, plain(o))
def roi():
    p = g.find('De la prière pour le roi')[0]; o, n = g.parse(p)
    hs = [i for i, (k, t) in enumerate(o) if re.search(r'ARTICLE \(', t)]
    ch, toc = {}, []
    for k, i in enumerate(hs):
        end = hs[k + 1] if k + 1 < len(hs) else len(o)
        t = re.sub(r'\s*\(.*', '', o[i][1]).capitalize().replace('Deuxieme', 'Deuxième') + ' (' + re.search(r'\((.*)\)', o[i][1]).group(1) + ')'
        cid = '%02d' % (k + 1)
        ch[cid] = b.chapter_md(t, o[i + 1:end], n); toc.append((cid, t))
    book_of('priere-pour-le-roi', 'gueranger-priere-pour-le-roi',
      {'fr-FR': 'De la prière pour le roi', 'en-US': 'On Prayer for the King', 'pt-BR': 'Da oração pelo rei'},
      {'fr-FR': 'Articles de Prosper Guéranger parus dans le Mémorial catholique à l’automne de 1830 sur la prière liturgique pour le roi après la chute de Charles X. Le chapeau explicatif de Dom Delatte est omis.',
       'en-US': 'Articles by Prosper Guéranger published in the Mémorial catholique in the autumn of 1830 on the liturgical prayer for the king after the fall of Charles X. Dom Delatte’s explanatory headnote is left out.',
       'pt-BR': 'Artigos de Prosper Guéranger publicados no Mémorial catholique no outono de 1830 sobre a oração litúrgica pelo rei após a queda de Carlos X. O resumo explicativo de Dom Delatte foi omitido.'},
      '1830', {'editor': 'Mémorial catholique (Paris)', 'year': 1830},
      [b.src('fr-FR', b.DG + 'de-la-priere-pour-le-roi/', 'De la prière pour le roi, Mémorial catholique, October-November 1830 (domgueranger.net HTML transcription)', 'Articles in the order of the site.')],
      toc, ch, plain(o))
if __name__ == '__main__':
    for f in sys.argv[1:]: globals()[f]()
