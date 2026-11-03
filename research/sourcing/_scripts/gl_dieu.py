import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
from gl_perfection import fixfr, tfr
IA = RAW + 'garrigou-lagrange/ia/'
HF = [re.compile(r'^\S{0,3}\s?[A-ZÉÈ][A-ZÉÈ\' ,\-:;’I]{4,}\s*\S{0,6}$'), re.compile(r'^(PREMI|DEUXI)\S* PARTIE\s*\S\s*[A-Z ]+\S{0,6}$')]
HE = [re.compile(r'^\d{0,3}\s*[A-Z][A-Z\'’ ,\-:;]{4,}\s*\S{0,6}$'), re.compile(r'^[A-Z][A-Za-z ,\'’\-:]{4,40}\s\d{1,3}$')]
AUTH = dict(author={'fr-FR': 'Réginald Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'})
TF = [('Wuat the cathotic cuurcu tracues asout gon’s existence and his nature, and the knowlepcee wuich we can have of him sy means of the natural licut or reason', 'What the Catholic Church teaches about God’s existence and His nature, and the knowledge we can have of Him by the natural light of reason'),
 ('Tue possipitiry of proving the existence or gop', 'The possibility of proving the existence of God'),
 ('Wuat Formatiy Consitirutes THE Divine Nature Accorpine TO Our Imperrect Mope or Knowine It', 'What formally constitutes the divine nature according to our imperfect mode of knowing it'),
 ('Tue derivation of the atiributes from self-subsisting beinc', 'The derivation of the attributes from self-subsisting being'),
 ('Tue special antrnomigs relating to freedom', 'The special antinomies relating to freedom'),
 ('Gop’s ineffability and the absurdity of the unknowable. conclusion and confirmation', 'God’s ineffability and the absurdity of the unknowable. Conclusion and confirmation'),
 ('Expose of the proofs for the existence of god', 'Exposition of the proofs for the existence of God'),
 ('Attributes relative to the being of god', 'Attributes relative to the being of God'),
 ('Attributes relative to the divine operations', 'Attributes relative to the divine operations'),
 ('perfections of god', 'perfections of God'), ('eminence of the deity', 'eminence of the Deity')]
def tfe(t):
    for a, b in TF:
        t = t.replace(a, b)
    return t


if __name__ == '__main__':
    f = load(IA + 'GarrigouLagrangeFrench--Dieu,_son_existence_et_sa_nature;_solution_Thomiste_des_antinomies_agnostiques____-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt')
    kw = dict(prx=re.compile(r'^CHAPITR\S{0,2} (1er|Ier|I{1,3}|IV|V)\.?$', re.I), urx=None, heads=HF, fix=fixfr, pre=pre_common, words=('Chapitre', 'Article', 'Introduction'), tfix=tfr, ptitle_lines=4)
    pre = chunk(f[818:978], 'avant-propos', 'Avant-propos', HF, fix=fixfr, pre=pre_common)
    h1 = chunk(f[978:1000], 'x', 'x', HF)  # unused
    p1 = parse(f[980:20490], **kw)
    p2 = parse(f[20490:47982], p0=3, **kw)
    note = chunk(f[47982:48240], 'note-principes', 'Note sur la valeur des principes (lettre de P. Duhem)', HF, fix=fixfr, pre=pre_common)
    fr = [pre] + p1 + p2 + [note]
    print([(n['id'], n['wc'], n['title'][:50]) for n in fr])
    meta = dict(id='garrigou-dieu-son-existence-et-sa-nature', cover='quarter',
        name={'fr-FR': 'Dieu, son existence et sa nature : solution thomiste des antinomies agnostiques', 'en-US': 'God: His Existence and His Nature (French original)', 'pt-BR': 'Deus, sua existência e sua natureza: solução tomista das antinomias agnósticas'},
        description={'fr-FR': 'Théodicée thomiste en deux parties : l’existence de Dieu (enseignement de l’Église, démonstrabilité, preuves) et sa nature et ses attributs (constitutif formel de la divinité, attributs, antinomies). Première édition, Beauchesne, 1914, avec la note sur la valeur des principes.',
            'en-US': 'Thomistic natural theology in two parts: the existence of God (the Church’s teaching, demonstrability, the proofs) and His nature and attributes (the formal constitutive of the Godhead, the attributes, the antinomies). First edition, Beauchesne, 1914. The English translation, made from the fifth edition, is its own book.',
            'pt-BR': 'Teodiceia tomista em duas partes: a existência de Deus (ensinamento da Igreja, demonstrabilidade, provas) e sua natureza e atributos (constitutivo formal, atributos, antinomias). Primeira edição, Beauchesne, 1914.'},
        composed='1914', work='garrigou-lagrange/dieu-son-existence-et-sa-nature',
        editions={'fr-FR': {'editor': 'Beauchesne, Paris (1st ed.)', 'year': 1914}},
        sources=[{'language': 'fr-FR', 'url': 'https://archive.org/details/GarrigouLagrangeFrench', 'edition': 'Dieu, son existence et sa nature, Beauchesne, 1914 (Google scan on archive.org, OCR text); part and chapter divisions only, the book’s numbered sections are not split'}], **AUTH)
    print(finish('garrigou-lagrange-opera-omnia/dieu-son-existence-et-sa-nature', meta, {'fr-FR': fr}, srcs=[('french-originals', IA + 'GarrigouLagrangeFrench--Dieu,_son_existence_et_sa_nature;_solution_Thomiste_des_antinomies_agnostiques____-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt', 'dieu-1914-archive-org.txt')]))
    # English
    e1 = load(IA + 'Lagrange-English--God,_His_Existence_and_His_Nature-1_djvu.txt'); e2 = load(IA + 'Lagrange-English--God,_His_existence_and_His_nature-2_djvu.txt')
    kwe = dict(prx=re.compile(r'^CHAPTER [IVX]{1,4}$'), urx=re.compile(r'^ARTICLE [IVX]{1,4}$'), heads=HE, fix=fix_en, pre=pre_common, words=('Chapter', 'Article', 'Introduction'), ptitle_lines=3, tfix=tfe)
    pref = chunk(en_prepare(e1[107:200], HE), 'prefaces', 'Prefaces to the first, third and fifth editions', HE, fix=fix_en, pre=pre_common)
    q1 = parse(en_prepare(e1[536:16270], HE), **kwe)
    app1 = chunk(en_prepare(e1[16272:], HE), 'appendix-1', 'Appendix to Part I: The Thomistic Proofs for the Existence of God in Relation to the Notion of Proper Cause', HE, fix=fix_en, pre=pre_common)
    q2 = parse(en_prepare(e2[337:19606], HE), p0=3, **kwe)
    aps = [chunk(en_prepare(e2[a:b], HE), f'appendix-{i+2}', f'Appendix {roman(i+1)} to Part II', HE, fix=fix_en, pre=pre_common) for i, (a, b) in enumerate([(19606, 19862), (19862, 19998), (19998, 20401), (20401, 25365)])]
    en = [pref] + q1 + [app1] + q2 + aps
    print([(n['id'], n['wc'], n['title'][:50]) for n in en])
    meta2 = dict(meta, id='garrigou-god-his-existence-and-nature-rose', name={'fr-FR': 'Dieu, son existence et sa nature (traduction anglaise)', 'en-US': 'God: His Existence and His Nature', 'pt-BR': 'Deus, sua existência e sua natureza (tradução inglesa)'},
        description={'en-US': 'Thomistic natural theology in two volumes: the existence of God and His nature and attributes, with the antinomies of agnosticism. Dom Bede Rose’s translation of the fifth French edition (Herder, 1934-36), with the author’s prefaces and appendices.', 'pt-BR': 'Teodiceia tomista em dois volumes: a existência de Deus e sua natureza e atributos. Tradução de Dom Bede Rose da quinta edição francesa (Herder, 1934-36).'},
        editions={'en-US': {'translator': 'Dom Bede Rose, O.S.B.', 'year': 1934}},
        sources=[{'language': 'en-US', 'url': 'https://archive.org/details/Lagrange-English', 'edition': 'God: His Existence and His Nature, tr. Dom Bede Rose, 2 vols, St. Louis: B. Herder, 1934-36 (from the 5th French edition); the index is not imported'}])
    print(finish('garrigou-lagrange-opera-omnia/god-his-existence-and-nature-rose', meta2, {'en-US': en}, srcs=[('english-originals', IA + 'Lagrange-English--God,_His_Existence_and_His_Nature-1_djvu.txt', 'god-1934-vol1-archive-org.txt'), ('english-originals', IA + 'Lagrange-English--God,_His_existence_and_His_nature-2_djvu.txt', 'god-1936-vol2-archive-org.txt')]))
