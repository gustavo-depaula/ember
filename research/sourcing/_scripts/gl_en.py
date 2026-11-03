import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
IA = RAW + 'garrigou-lagrange/ia/'
PRX = re.compile(r'^PART\s+(I{1,3}|IV|V|ONE|TWO|THREE|FOUR|FIVE|MI|II1)\.?$', re.I)
URX = re.compile(r'^CHAPTER\s+([IVXLCMl1]{1,8}|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[0-9]{1,2}|[A-Z]{1,3})\.?$', re.I)
AUTH = {'fr-FR': 'Réginald Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'}


def tfe(t):
    t = re.sub(r'\bTue\b', 'The', t)
    t = re.sub(r'\b[Gg]op\b', 'God', t)
    t = re.sub(r'\bgod\b', 'God', t)
    t = re.sub(r'\bwuat\b', 'what', t, flags=re.I)
    return t


def build(cfg):
    files = cfg['files']  # list of file names (volumes)
    nodes, p0, u0 = [], 0, 0
    for k, fn in enumerate(files):
        lines = load(IA + fn)
        heads = auto_heads(lines)
        hd = lambda t, h=heads: any(f(t) for f in h)
        prx = cfg.get('prx', PRX) if cfg.get('parts', True) else None
        st = cfg.get('start', [None] * len(files))[k] or find_body(lines, prx, cfg.get('urx', URX))
        en = cfg.get('end', [None] * len(files))[k] or find_end(lines, st)
        if k == 0:
            fr = find_front(lines, st)
            if fr and cfg.get('front', True):
                nodes.append(chunk(en_prepare(lines[fr[0]:fr[1]], heads), 'foreword', cfg.get('front_title', 'Foreword'), heads, fix=fix_en, pre=pre_common))
        body = parse(en_prepare(lines[st:en], heads), prx=prx, urx=cfg.get('urx', URX), heads=heads, fix=fix_en, pre=pre_common, words=('Part', 'Chapter', 'Introduction'),
                     p0=p0, u0=u0, continuous=True, bare=cfg.get('bare', False), tfix=tfe, ptitle_lines=3, utitle_lines=3)
        parents = {n['parent'][0] for n in body if n['parent']}
        nu = sum(1 for n in body if n['kind'] == 'u' or not n['parent'])
        p0 += len(parents) if prx else 0
        u0 += nu
        nodes += body
        print(' ', fn[:40], st, en, len(body), [n['wc'] for n in body][:60])
    meta = dict(id=cfg['id'], cover='quarter', name=cfg['name'], author=AUTH, description=cfg['desc'], composed=cfg['composed'], work=cfg['work'],
                editions={'en-US': {'translator': cfg['translator'], 'year': cfg['year']}},
                sources=[{'language': 'en-US', 'url': 'https://archive.org/details/' + cfg['ia'], 'edition': cfg['edition']}])
    wc = finish('garrigou-lagrange-opera-omnia/' + cfg['slug'], meta, {'en-US': nodes}, srcs=[('english-originals', IA + f, cfg['slug'] + f'-{i+1}-archive-org.txt') for i, f in enumerate(files)])
    print(cfg['slug'], wc, len(nodes))


L = lambda n: 'Lagrange-English--' + n + '_djvu.txt'
G = lambda n: 'Garrigou-LagrangeEnglish--' + n + '_-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt'
BOOKS = {
 'three-ages': dict(slug='three-ages-of-the-interior-life-doyle', id='garrigou-three-ages-interior-life', files=[L('The_Three_Ages_Of_The_Spiritual_Life-1'), L('The_Three_Ages_Of_The_Spiritual_Life-2')], start=[2282, 1224], end=[None, None],
   name={'fr-FR': 'Les Trois Âges de la vie intérieure (traduction anglaise)', 'en-US': 'The Three Ages of the Interior Life', 'pt-BR': 'As três idades da vida interior (tradução inglesa)'},
   desc={'en-US': 'Prelude of eternal life: the magnum opus of Garrigou-Lagrange on the sources of the interior life and its three ages, purgative, illuminative and unitive, with the prayer of the Church, infused contemplation and the call to it. Sr. M. Timothea Doyle’s English of Les Trois Âges de la vie intérieure (1938), 2 vols, Herder 1947-48.', 'pt-BR': 'Prelúdio da vida eterna: a obra maior de Garrigou-Lagrange sobre as fontes da vida interior e suas três idades, purgativa, iluminativa e unitiva. Tradução inglesa de Sr. M. Timothea Doyle (Herder, 1947-48) de Les Trois Âges de la vie intérieure (1938).'},
   composed='1938', work='garrigou-lagrange/trois-ages-de-la-vie-interieure', translator='Sr. M. Timothea Doyle, O.P.', year=1947, ia='Lagrange-English', edition='The Three Ages of the Interior Life: Prelude of Eternal Life, tr. Sr. M. Timothea Doyle, O.P., 2 vols, St. Louis: B. Herder, 1947-48 (archive.org Lagrange-English; the French tome 1 is not open)'),
 'providence': dict(slug='providence-rose', id='garrigou-providence', files=[L('Providence')], start=[279], end=[None],
   name={'fr-FR': 'La Providence et la confiance en Dieu (traduction anglaise)', 'en-US': 'Providence', 'pt-BR': 'A Providência e a confiança em Deus (tradução inglesa)'},
   desc={'en-US': 'Fidelity to duty and abandonment to divine Providence: the nature of providence and its mysteries, the divine government, the problem of evil, and the trust in God that follows. Dom Bede Rose’s translation of La Providence et la confiance en Dieu (1932), Herder 1937.', 'pt-BR': 'Fidelidade ao dever e abandono à Providência divina: a natureza da providência e seus mistérios, o governo divino, o problema do mal e a confiança em Deus. Tradução inglesa de Dom Bede Rose (Herder, 1937) de La Providence et la confiance en Dieu (1932).'},
   composed='1932', work='garrigou-lagrange/providence-et-confiance-en-dieu', translator='Dom Bede Rose, O.S.B.', year=1937, ia='Lagrange-English', edition='Providence, tr. Dom Bede Rose, O.S.B., St. Louis: B. Herder, 1937 (7th printing 1953), archive.org Lagrange-English; the French original is not open'),
 'mother': dict(slug='mother-of-the-saviour-kelly', id='garrigou-mother-of-the-saviour', files=[L('The_Mother_of_the_Saviour_and_Our_Interior_Life')], start=[342], end=[None],
   name={'fr-FR': 'La Mère du Sauveur et notre vie intérieure (traduction anglaise)', 'en-US': 'The Mother of the Saviour and Our Interior Life', 'pt-BR': 'A Mãe do Salvador e a nossa vida interior (tradução inglesa)'},
   desc={'en-US': 'Mariology in the service of the interior life: Mary’s predestination and divine maternity, her fullness of grace, her mediation and her motherhood of souls, and her part in the soul’s progress to union. Bernard J. Kelly’s translation of La Mère du Sauveur et notre vie intérieure (1941), Golden Eagle Books, Dublin 1948.', 'pt-BR': 'A mariologia a serviço da vida interior: a predestinação de Maria e sua maternidade divina, a plenitude de graça, a mediação e a maternidade espiritual, e seu papel no progresso da alma até a união. Tradução inglesa de Bernard J. Kelly (Dublin, 1948) de La Mère du Sauveur et notre vie intérieure (1941).'},
   composed='1941', work='garrigou-lagrange/mere-du-sauveur', translator='Bernard J. Kelly, C.S.Sp.', year=1948, ia='Lagrange-English', edition='The Mother of the Saviour and Our Interior Life, tr. Bernard J. Kelly, C.S.Sp., Dublin: Golden Eagle Books, 1948 (archive.org Lagrange-English); the French original is not open'),
}
def mk(slug, id, f, fr_name, en_name, pt_name, en_desc, pt_desc, composed, work, translator, year, edition, start=None, **kw):
    return dict(slug=slug, id=id, files=f if isinstance(f, list) else [f], start=start or [None] * (len(f) if isinstance(f, list) else 1),
                end=[None] * (len(f) if isinstance(f, list) else 1), name={'fr-FR': fr_name, 'en-US': en_name, 'pt-BR': pt_name}, desc={'en-US': en_desc, 'pt-BR': pt_desc},
                composed=composed, work=work, translator=translator, year=year, ia='Lagrange-English', edition=edition, **kw)


BOOKS.update({
 'predestination': mk('predestination-rose', 'garrigou-predestination', L('Predestination'), 'La prédestination des saints et la grâce (traduction anglaise)', 'Predestination', 'A predestinação dos santos e a graça (tradução inglesa)',
   'The Thomist doctrine of predestination: the mystery of God’s love, the divine will and its efficacy, grace and free will, and the objections of Molinism, in the light of St. Thomas and Scripture. Dom Bede Rose’s translation of La prédestination des saints et la grâce (1936), Herder 1939.', 'A doutrina tomista da predestinação: o mistério do amor de Deus, a vontade divina e sua eficácia, a graça e o livre-arbítrio. Tradução inglesa de Dom Bede Rose (Herder, 1939) de La prédestination des saints et la grâce (1936).',
   '1936', 'garrigou-lagrange/predestination-des-saints', 'Dom Bede Rose, O.S.B.', 1939, 'Predestination, tr. Dom Bede Rose, O.S.B., St. Louis: B. Herder, 1939 (archive.org Lagrange-English); the French original is not open', start=[526]),
 'reality': mk('reality-cummins', 'garrigou-reality', L('Reality__A_Synthesis_of_Thomistic_Thought'), 'La synthèse thomiste (traduction anglaise)', 'Reality: A Synthesis of Thomistic Thought', 'A síntese tomista (tradução inglesa)',
   'The whole of Thomistic thought in synthesis: being and its laws, God, creation, man, the moral and the supernatural order, from the first principles to the end of life. Patrick Cummins’s translation of La synthèse thomiste (1946), Herder 1950.', 'Todo o pensamento tomista em síntese: o ser e suas leis, Deus, a criação, o homem, a ordem moral e a ordem sobrenatural. Tradução inglesa de Patrick Cummins (Herder, 1950) de La synthèse thomiste (1946).',
   '1946', 'garrigou-lagrange/synthese-thomiste', 'Patrick Cummins, O.S.B.', 1950, 'Reality: A Synthesis of Thomistic Thought, tr. Patrick Cummins, O.S.B., St. Louis: B. Herder, 1950 (archive.org Lagrange-English); the French original is not open', parts=False),
 'priest': mk('priest-in-union-with-christ-shelton', 'garrigou-priest-in-union-with-christ', L('Priest_in_Union_with_Christ'), 'De unione sacerdotis cum Christo (traduction anglaise)', 'The Priest in Union with Christ', 'O sacerdote em união com Cristo (tradução inglesa)',
   'The priest’s union with Christ the Priest and Victim: the priesthood of Christ, the priest’s spiritual life, and his sanctification through the Mass, the divine office and prayer, from the author’s 1948 treatise. G. W. Shelton’s translation (Mercier Press, Cork 1951; Newman Press 1952).', 'A união do sacerdote com Cristo Sacerdote e Vítima: o sacerdócio de Cristo, a vida espiritual do sacerdote e sua santificação. Tradução inglesa de G. W. Shelton (Cork, 1951).',
   '1948', 'garrigou-lagrange/unione-sacerdotis-cum-christo', 'G. W. Shelton', 1951, 'The Priest in Union with Christ, tr. G. W. Shelton, Cork: Mercier Press, 1951 (Westminster, Md.: Newman Press, 1952), archive.org Lagrange-English; the Latin original is not open', start=[336]),
 'three-ways': mk('three-ways-of-the-spiritual-life', 'garrigou-three-ways-spiritual-life', L('The_Three_Ways_of_the_Spiritual_Life'), 'Les trois conversions et les trois voies (traduction anglaise)', 'The Three Ways of the Spiritual Life', 'As três vias da vida espiritual (tradução inglesa)',
   'The three conversions and the three ways of the spiritual life: the purgative, illuminative and unitive ways, and the passage from each to the next. English version of Les trois conversions et les trois voies (1933), Burns Oates, London 1938; Newman Press 1950.', 'As três conversões e as três vias da vida espiritual: via purgativa, iluminativa e unitiva. Versão inglesa de Les trois conversions et les trois voies (1933), Londres, 1938.',
   '1933', 'garrigou-lagrange/trois-conversions-et-trois-voies', 'Unnamed translator (Burns Oates)', 1938, 'The Three Ways of the Spiritual Life, London: Burns Oates & Washbourne, 1938 (Westminster, Md.: Newman Press, 1950), archive.org Lagrange-English; the French original is not open', start=[281], parts=False),
 'saviour': mk('our-saviour-and-his-love-for-us-bouchard', 'garrigou-our-saviour-and-his-love', G('Our_Saviour_and_His_Love_for_us'), 'Le Sauveur et son amour pour nous (traduction anglaise)', 'Our Saviour and His Love for Us', 'O Salvador e o seu amor por nós (tradução inglesa)',
   'Christ’s love for us and the mystery of the Redemption: the Incarnation, the Savior’s knowledge and love, the Passion and the Cross, and our response of love. A. Bouchard’s translation of Le Sauveur et son amour pour nous (1933), Herder 1951.', 'O amor de Cristo por nós e o mistério da Redenção: a Encarnação, o conhecimento e o amor do Salvador, a Paixão e a Cruz. Tradução inglesa de A. Bouchard (Herder, 1951) de Le Sauveur et son amour pour nous (1933).',
   '1933', 'garrigou-lagrange/sauveur-et-son-amour', 'A. Bouchard', 1951, 'Our Saviour and His Love for Us, tr. A. Bouchard, St. Louis: B. Herder, 1951 (archive.org Garrigou-LagrangeEnglish); the French original is not open'),
 'life-everlasting': mk('life-everlasting-cummins', 'garrigou-life-everlasting', L('Life_Everlasting'), 'L’éternelle vie et la profondeur de l’âme (traduction anglaise)', 'Life Everlasting', 'A vida eterna e a profundidade da alma (tradução inglesa)',
   'The last things and the depth of the soul: death and judgment, purgatory, heaven and hell, and the eternal life begun by grace. Patrick Cummins’s translation of L’éternelle vie et la profondeur de l’âme (1950), Herder 1952.', 'As últimas coisas e a profundidade da alma: morte e juízo, purgatório, céu e inferno, e a vida eterna iniciada pela graça. Tradução inglesa de Patrick Cummins (Herder, 1952) de L’éternelle vie et la profondeur de l’âme (1950).',
   '1950', 'garrigou-lagrange/eternelle-vie', 'Patrick Cummins, O.S.B.', 1952, 'Life Everlasting, tr. Patrick Cummins, O.S.B., St. Louis: B. Herder, 1952 (archive.org Lagrange-English); the French original is not open', parts=True, bare=True, start=[284], prx=re.compile(r'^(FIRST|SECOND|THIRD|FOURTH|FIFTH) PART$'), urx=re.compile(r'^\x00$')),
})

def summa(slug, id, f, en_name, pt_name, desc, ptdesc, composed, work, tr, year, lat):
    return mk(slug, id, f, lat + ' (traduction anglaise)', en_name, pt_name, desc, ptdesc, composed, work, tr, year,
              f'{en_name}, {tr}, St. Louis: B. Herder, {year} (archive.org Lagrange-English); the Latin original is imported separately where available', parts=False)


BOOKS.update({
 'one-god': summa('one-god-rose', 'garrigou-one-god', L('The_One_God-I.1-26'), 'The One God: A Commentary on the First Part of St. Thomas’ Theological Summa', 'O Deus uno: comentário à Primeira Parte da Suma teológica',
   'Commentary on the Summa theologiae I, qq. 1-26: sacred doctrine, the existence of God, His simplicity, perfection, goodness, infinity, knowledge, will and love. Dom Bede Rose’s translation of De Deo uno (1938), Herder 1943.', 'Comentário à Suma teológica I, qq. 1-26: a doutrina sagrada, a existência de Deus, sua simplicidade, perfeição, bondade, infinidade, ciência, vontade e amor. Tradução inglesa de Dom Bede Rose (Herder, 1943) de De Deo uno (1938).', '1938', 'garrigou-lagrange/de-deo-uno', 'Dom Bede Rose, O.S.B.', 1943, 'De Deo uno'),
 'trinity': summa('trinity-and-god-the-creator-eckhoff', 'garrigou-trinity-and-god-the-creator', L('The_Trinity_and_God_the_Creator-I.27-119'), 'The Trinity and God the Creator: A Commentary on St. Thomas’ Theological Summa, Ia, q. 27-119', 'A Trindade e Deus Criador: comentário à Suma teológica I, qq. 27-119',
   'Commentary on the Summa theologiae I, qq. 27-119: the processions and the Persons of the Trinity, creation, the angels, the six days and man. Frederic C. Eckhoff’s translation of De Deo trino et creatore (1943), Herder 1952.', 'Comentário à Suma teológica I, qq. 27-119: as processões e as Pessoas da Trindade, a criação, os anjos, os seis dias e o homem. Tradução inglesa de Frederic C. Eckhoff (Herder, 1952) de De Deo trino et creatore (1943).', '1943', 'garrigou-lagrange/de-deo-trino-et-creatore', 'Frederic C. Eckhoff', 1952, 'De Deo trino et creatore'),
 'christ': summa('christ-the-saviour-rose', 'garrigou-christ-the-saviour', L('Christ_the_Savior-III.1-26,_31-59'), 'Christ the Saviour: A Commentary on the Third Part of St. Thomas’ Theological Summa', 'Cristo Salvador: comentário à Terceira Parte da Suma teológica',
   'Commentary on the Summa theologiae III, qq. 1-26 and 31-59: the fittingness and mode of the Incarnation, Christ’s grace and knowledge, His mediation and priesthood, His life, Passion, Resurrection and Ascension. Dom Bede Rose’s translation of De Christo Salvatore (1945), Herder 1950.', 'Comentário à Suma teológica III, qq. 1-26 e 31-59: a conveniência e o modo da Encarnação, a graça e a ciência de Cristo, sua mediação e sacerdócio, sua vida, Paixão, Ressurreição e Ascensão. Tradução inglesa de Dom Bede Rose (Herder, 1950) de De Christo Salvatore (1945).', '1945', 'garrigou-lagrange/de-christo-salvatore', 'Dom Bede Rose, O.S.B.', 1950, 'De Christo Salvatore'),
 'grace': summa('grace-corpus-christi-nuns', 'garrigou-grace', L('Grace-I-II.109-114'), 'Grace: Commentary on the Theological Summa of St. Thomas, Ia IIae, q. 109-114', 'A graça: comentário à Suma teológica I-II, qq. 109-114',
   'Commentary on the Summa theologiae I-II, qq. 109-114: the necessity of grace, its essence, its causes, justification and merit, with the long excursus on sufficient and efficacious grace. Translation by the Dominican Nuns of Corpus Christi Monastery, Menlo Park, of De gratia (1946-47), Herder 1952.', 'Comentário à Suma teológica I-II, qq. 109-114: a necessidade da graça, sua essência, suas causas, a justificação e o mérito, com o longo excurso sobre a graça suficiente e eficaz. Tradução inglesa das monjas dominicanas de Corpus Christi, Menlo Park (Herder, 1952) de De gratia (1946-47).', '1946', 'garrigou-lagrange/de-gratia', 'Dominican Nuns of Corpus Christi Monastery, Menlo Park', 1952, 'De gratia'),
 'beatitude': summa('beatitude-cummins', 'garrigou-beatitude', L('Beatitude-I-II.1-54'), 'Beatitude: A Commentary on St. Thomas’ Theological Summa, Ia IIae, q. 1-54', 'A bem-aventurança: comentário à Suma teológica I-II, qq. 1-54',
   'Commentary on the Summa theologiae I-II, qq. 1-54: man’s last end, beatitude, human acts, the passions and habits. Patrick Cummins’s translation of De beatitudine (1951), Herder 1956.', 'Comentário à Suma teológica I-II, qq. 1-54: o fim último do homem, a bem-aventurança, os atos humanos, as paixões e os hábitos. Tradução inglesa de Patrick Cummins (Herder, 1956) de De beatitudine (1951).', '1951', 'garrigou-lagrange/de-beatitudine', 'Patrick Cummins, O.S.B.', 1956, 'De beatitudine'),
})
if __name__ == '__main__':
    for k in (sys.argv[1:] or BOOKS):
        build(BOOKS[k])
