import re, sys
import gue_dg as g, gue_build as b

def srcraw(items):
    return '\n\n---\n\n'.join('# %s\n\n%s' % (t, '\n\n'.join(x for _, x in o)) for t, o in items)

def drop_head(o, pat, maxn=9):
    i = 0
    while i < min(len(o), maxn) and re.match(pat, o[i][1]): i += 1
    return o[i:]
def drop_italic_lead(o):
    while o and re.match(r'^\*[^*].*\*$', o[0][1]) : o = o[1:]
    return o
def uniq(ps):
    s = {}; [s.setdefault(p['id'], p) for p in ps]; return list(s.values())

# ---------- Marie d'Agréda
def agreda():
    ps = uniq(g.find('Marie d’Agr'))
    ps.sort(key=lambda p: int(re.search(r'(\d+)\w* article', g.title(p)).group(1)))
    ch, toc, raw = {}, [], []
    for i, p in enumerate(ps, 1):
        o, n = g.parse(p)
        raw.append((g.title(p), o))
        o = o[2:]
        t = 'Premier article' if i == 1 else '%de article' % i if False else ('%d%s article' % (i, 'er' if i == 1 else 'e'))
        t = 'Premier article' if i == 1 else 'Article %d' % i
        cid = '%02d' % i
        ch[cid] = b.chapter_md(t, o, n); toc.append((cid, t))
    d = b.book('gueranger-marie-d-agreda', 'marie-d-agreda',
      {'fr-FR': 'Marie d’Agréda et la Cité mystique de Dieu', 'en-US': 'Mary of Agreda and the Mystical City of God', 'pt-BR': 'Maria de Ágreda e a Cidade mística de Deus'},
      {'fr-FR': 'Série de vingt-huit articles publiés dans L’Univers (1858-1859) : Dom Guéranger présente la vie de la vénérable Marie d’Agréda et la Cité mystique de Dieu, discute les règles des révélations privées, et retrace l’histoire des attaques contre le livre, notamment la censure de la Sorbonne de 1696.',
       'en-US': 'Twenty-eight articles published in L’Univers (1858-1859): Dom Guéranger presents the life of the venerable Mary of Agreda and the Mystical City of God, discusses the rules for private revelations, and traces the history of the attacks on the book, above all the Sorbonne censure of 1696.',
       'pt-BR': 'Série de vinte e oito artigos publicados em L’Univers (1858-1859): Dom Guéranger apresenta a vida da venerável Maria de Ágreda e a Cidade mística de Deus, discute as regras das revelações privadas e traça a história dos ataques ao livro, sobretudo a censura da Sorbonne de 1696.'},
      '1858', ['fr-FR'], {'fr-FR': {'editor': 'L’Univers (Paris)', 'year': 1859}},
      [b.src('fr-FR', b.DG + '?cat=Marie d’Agréda', 'Marie d’Agréda et la Cité mystique de Dieu, 28 articles, L’Univers, 24 May 1858 to 1859 (domgueranger.net HTML transcription)', 'The site’s own one-line summary heading each article is left out.')],
      b.toc_of(toc))
    b.write_book('marie-d-agreda', d, {'fr-FR': ch}, {'marie-d-agreda': ('french', srcraw(raw))})

# ---------- Jansénisme
def jansenisme():
    spec = [('Le jansénisme et la compagnie de Jésus – 1', '1-article', 'Premier article'),
            ('Le jansénisme et la compagnie de Jésus – 2', '2-article', 'Deuxième article'),
            ('Le jansénisme et la compagnie de Jésus – 3', '3-article', 'Troisième et dernier article'),
            ('Le Jansénisme et la compagnie de Jésus – polémique', '4-chronique-polemique', 'Chronique : polémique'),
            ('Contre le jansénisme', '5-chronique-bernier', 'Chronique : réponses à l’abbé Bernier')]
    ch, toc, raw = {}, [], []
    for pre, cid, t in spec:
        p = g.find(pre)[0]; o, n = g.parse(p); raw.append((g.title(p), o))
        o = drop_head(o, r'^(LE JANS|TROISI|DEUXI|« Revue|Angers|1858|tome|\*?Dom Guéranger, Le jans|pp\. |CHRONIQUE)', 9)
        ch[cid] = b.chapter_md(t, o, n); toc.append((cid, t))
    d = b.book('gueranger-jansenisme', 'jansenisme',
      {'fr-FR': 'Le jansénisme et la Compagnie de Jésus', 'en-US': 'Jansenism and the Society of Jesus', 'pt-BR': 'O jansenismo e a Companhia de Jesus'},
      {'fr-FR': 'Trois articles et deux chroniques parus en 1858 dans la Revue de l’Anjou et du Maine : Dom Guéranger répond à l’abbé Bernier sur la responsabilité du jansénisme, de la Compagnie de Jésus et de leurs querelles dans l’histoire de l’Église de France.',
       'en-US': 'Three articles and two notes published in 1858 in the Revue de l’Anjou et du Maine: Dom Guéranger answers the abbé Bernier on the part of Jansenism, the Society of Jesus and their quarrels in the history of the Church in France.',
       'pt-BR': 'Três artigos e duas crônicas publicados em 1858 na Revue de l’Anjou et du Maine: Dom Guéranger responde ao abade Bernier sobre o papel do jansenismo, da Companhia de Jesus e de suas querelas na história da Igreja da França.'},
      '1858', ['fr-FR'], {'fr-FR': {'editor': 'Revue de l’Anjou et du Maine (Angers, Cosnier et Lachèse)', 'year': 1858}},
      [b.src('fr-FR', b.DG + '?cat=Le jansénisme et la compagnie de Jésus', 'Revue de l’Anjou et du Maine, t. 2-3, Angers, Cosnier et Lachèse, 1858 (domgueranger.net HTML transcription)', 'Articles 1-3 and the two Chronique notes.')],
      b.toc_of(toc))
    b.write_book('jansenisme', d, {'fr-FR': ch}, {'jansenisme': ('french', srcraw(raw))})

# ---------- Considérations
def considerations():
    spec = [('Considérations sur la liturgie catholique – 1er', '1-article-1', 'Premier article (28 février 1830)'),
            ('Considérations sur la liturgie catholique – 2', '2-article-2', 'Deuxième article (31 mars 1830)'),
            ('Considérations sur la liturgie catholique – 3', '3-article-3', 'Troisième article (31 mai 1830)'),
            ('Polémique sur l’usage', '4-polemique-liturgies-diocesaines', 'Polémique sur l’usage des liturgies diocésaines en France (2-9 juin 1830)'),
            ('Défense des considérations', '5-defense', 'Défense des Considérations sur la liturgie catholique (15 juin 1830)'),
            ('Sur une réponse', '6-sur-une-reponse', 'Sur une réponse de l’auteur des Considérations (3 juillet 1830)'),
            ('Nouvelle défense', '7-nouvelle-defense', 'Nouvelle défense des Considérations sur la liturgie catholique (15 juillet 1830)'),
            ('Considérations sur la liturgie catholique (31 juillet', '8-article-4', 'Quatrième article (31 juillet 1830)')]
    ch, toc, raw = {}, [], []
    for pre, cid, t in spec:
        p = g.find(pre)[0]; o, n = g.parse(p); raw.append((g.title(p), o))
        if cid == '1-article-1':
            k = [i for i, (_, x) in enumerate(o) if x.startswith('PREMIER ARTICLE')][0]
            o = o[k + 1:]
        o = drop_head(o, r'^(DÉFENSE DES|QUATRIEME|\d+ juillet|\d+ juin)', 3)
        o = drop_italic_lead(o)
        o = drop_head(o, r'^(QUATRIEME ARTICLE|DÉFENSE DES)', 2)
        ch[cid] = b.chapter_md(t, o, n); toc.append((cid, t))
    d = b.book('gueranger-considerations-liturgie', 'considerations-liturgie',
      {'fr-FR': 'Considérations sur la liturgie catholique', 'en-US': 'Considerations on the Catholic Liturgy', 'pt-BR': 'Considerações sobre a liturgia católica'},
      {'fr-FR': 'Les quatre premiers écrits de Prosper Guéranger (Mémorial catholique, 1830) : antiquité, universalité, autorité et onction comme caractères de la liturgie, avec les pièces de la polémique qui les suivit dans l’Ami de la Religion et du Roi. Les chapeaux explicatifs que Dom Delatte y a mêlés dans sa biographie sont omis.',
       'en-US': 'Prosper Guéranger’s first writings (Mémorial catholique, 1830): antiquity, universality, authority and unction as the marks of the liturgy, with the pieces of the polemic that followed in the Ami de la Religion et du Roi. Dom Delatte’s explanatory headnotes, mixed in from his biography, are left out.',
       'pt-BR': 'Os primeiros escritos de Prosper Guéranger (Mémorial catholique, 1830): antiguidade, universalidade, autoridade e unção como marcas da liturgia, com as peças da polêmica que se seguiu no Ami de la Religion et du Roi. Os resumos explicativos que Dom Delatte intercalou em sua biografia foram omitidos.'},
      '1830', ['fr-FR'], {'fr-FR': {'editor': 'Mémorial catholique (Paris)', 'year': 1830}},
      [b.src('fr-FR', b.DG + '?cat=Considérations sur la liturgie catholique', 'Mémorial catholique and Ami de la Religion et du Roi, 1830 (domgueranger.net HTML transcription, via Delatte’s collection)', 'Eight pieces in chronological order.')],
      b.toc_of(toc))
    b.write_book('considerations-liturgie', d, {'fr-FR': ch}, {'considerations-liturgie': ('french', srcraw(raw))})

if __name__ == '__main__':
    for f in sys.argv[1:]: globals()[f]()
