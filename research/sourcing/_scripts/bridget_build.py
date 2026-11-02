"""Build Bridget of Sweden's Latin books from the DCO dump. Usage: bridget_build.py <key>...
keys: 1..8, extrav, regula, sermo, orationes"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(__file__))
import bridget_parse as P

ROOT = '/Users/gustavo/Documents/prayer/content/books/bridget-of-sweden-opera-omnia'
URL = 'https://www.documentacatholicaomnia.eu/04z/z_1303-1373__Birgitta_de_Regno_Swecie__Revelaciones__LT.doc.html'

AUTHOR = {'la': 'Birgitta de Regno Swecie', 'en-US': 'St. Bridget of Sweden', 'pt-BR': 'Santa Brígida da Suécia'}

# key -> (dco book, slug, id, edition editor/year, names, descriptions, composed)
BOOKS = {
 '1': ('I', 'revelationes-1', 'bridget-revelationes-1', ('Carl-Gustaf Undhagen', 1978),
   ('Revelationes, liber I: Liber celestis reuelacionum', 'Revelations, Book I: The Heavenly Book of Revelations', 'Revelações, Livro I'),
   ('Primus liber reuelacionum, cum prologo magistri Mathie de Suecia: verba Christi et Marie ad Birgittam de incarnacione, de fide et de statu Ecclesie.',
    'The first book of the Revelations, with Master Matthias\'s prologue: words of Christ and of Mary to Bridget on the Incarnation, the faith and the state of the Church.',
    'O primeiro livro das Revelações, com o prólogo do mestre Matias: palavras de Cristo e de Maria a Brígida sobre a Encarnação, a fé e o estado da Igreja.'), 'c. 1344-1349'),
 '2': ('II', 'revelationes-2', 'bridget-revelationes-2', ('Carl-Gustaf Undhagen and Birger Bergh', 2001),
   ('Revelationes, liber II: Ad sponsam contra diabolum', 'Revelations, Book II: To the Bride, against the Devil', 'Revelações, Livro II'),
   ('Liber secundus reuelacionum: Filius ad sponsam contra diaboli temptaciones.',
    'The second book of the Revelations: the Son instructs the bride against the temptations of the devil.',
    'O segundo livro das Revelações: o Filho instrui a esposa contra as tentações do demônio.'), 'c. 1344-1349'),
 '3': ('III', 'revelationes-3', 'bridget-revelationes-3', ('Ann-Mari Jönsson', 1998),
   ('Revelationes, liber III: Monitio et informatio ad episcopum', 'Revelations, Book III: Admonition and Instruction to a Bishop', 'Revelações, Livro III'),
   ('Liber tertius reuelacionum: monita et informaciones ad Nicolaum Hermanni, episcopum Lincopensem, de modo vivendi et episcopale officium exercendi.',
    'The third book of the Revelations: counsels and instructions to a bishop on how to live and to exercise the episcopal office.',
    'O terceiro livro das Revelações: conselhos e instruções a um bispo sobre o modo de viver e de exercer o ofício episcopal.'), 'c. 1344-1349'),
 '4': ('IV', 'revelationes-4', 'bridget-revelationes-4', ('Hans Aili', 1992),
   ('Revelationes, liber IV: Verba Iohannis euangeliste ad sponsam', 'Revelations, Book IV: Words of John the Evangelist to the Bride', 'Revelações, Livro IV'),
   ('Liber quartus reuelacionum: reuelaciones de Christo, Maria, sanctis et statu mundi, cum allocucionibus Iohannis euangeliste.',
    'The fourth book of the Revelations: revelations on Christ, Mary, the saints and the state of the world, with the words of John the Evangelist.',
    'O quarto livro das Revelações: revelações sobre Cristo, Maria, os santos e o estado do mundo, com as palavras de João Evangelista.'), 'c. 1349-1352'),
 '5': ('V', 'revelationes-5', 'bridget-revelationes-5', ('Birger Bergh', 1971),
   ('Revelationes, liber V: Liber questionum', 'Revelations, Book V: The Book of Questions', 'Revelações, Livro V'),
   ('Liber questionum: quaestiones religiosi superbi et responsiones Christi iudicis, cum reuelacionibus Mariae.',
    'The Book of Questions: the questions of a proud religious and the answers of Christ the Judge, with revelations of Mary.',
    'O Livro das Questões: as perguntas de um religioso soberbo e as respostas de Cristo Juiz, com revelações de Maria.'), 'c. 1344-1349'),
 '6': ('VI', 'revelationes-6', 'bridget-revelationes-6', ('Birger Bergh', 1991),
   ('Revelationes, liber VI: Ego sum regina celi', 'Revelations, Book VI: I Am the Queen of Heaven', 'Revelações, Livro VI'),
   ('Liber sextus reuelacionum, ex Neapolitano et Romano tempore: reuelaciones de Christo, Maria, regibus et statu Ecclesiae.',
    'The sixth book of the Revelations, from her years in Naples and Rome: revelations on Christ, Mary, kings and the state of the Church.',
    'O sexto livro das Revelações, dos anos de Nápoles e Roma: revelações sobre Cristo, Maria, os reis e o estado da Igreja.'), 'c. 1350-1372'),
 '7': ('VII', 'revelationes-7', 'bridget-revelationes-7', ('Birger Bergh', 1967),
   ('Revelationes, liber VII: Peregrinatio', 'Revelations, Book VII: The Pilgrimage', 'Revelações, Livro VII'),
   ('Liber septimus reuelacionum: reuelaciones de peregrinacione Birgittae ad Terram Sanctam et de morte eius, a testibus relatae.',
    'The seventh book of the Revelations: revelations from Bridget\'s pilgrimage to the Holy Land, with witnesses\' accounts of her death.',
    'O sétimo livro das Revelações: revelações da peregrinação de Brígida à Terra Santa, com os relatos das testemunhas de sua morte.'), 'c. 1371-1373'),
 '8': ('VIII', 'revelationes-8', 'bridget-revelationes-8', ('Hans Aili', 2002),
   ('Liber celestis imperatoris ad reges (Revelationes, liber VIII)', 'The Heavenly Emperor\'s Book to Kings (Revelations, Book VIII)', 'O Livro do Imperador Celeste aos reis (Revelações, Livro VIII)'),
   ('Liber celestis imperatoris ad reges: reuelaciones ad reges et principes, cum Epistola solitarii (Alphonsi Pecha) de examine visionum.',
    'The Heavenly Emperor\'s Book to Kings: revelations for kings and princes, preceded by the Epistola solitarii (Alfonso of Jaén) on the discernment of visions.',
    'O Livro do Imperador Celeste aos reis: revelações para reis e príncipes, precedido da Epístola do solitário (Afonso de Jaén) sobre o discernimento das visões.'), 'c. 1344-1373'),
 'extrav': ('IX', 'revelaciones-extravagantes', 'bridget-revelaciones-extravagantes', ('Lennart Hollman', 1956),
   ('Revelaciones extrauagantes', 'Revelationes extravagantes', 'Revelationes extravagantes'),
   ('Reuelaciones celestes, quae extrauagantes appellantur: reuelaciones a Alphonso Hispano in libros non receptae, de regula, de sororibus et de rebus Ecclesiae.',
    'The Revelationes extravagantes: revelations Alfonso of Jaén did not include in the eight books, on the Rule, the sisters and the Church.',
    'As Revelationes extravagantes: revelações que Afonso de Jaén não incluiu nos oito livros, sobre a Regra, as irmãs e a Igreja.'), 'c. 1344-1373'),
 'regula': ('X', 'regula-salvatoris', 'bridget-regula-salvatoris', ('Sten Eklund', 1975),
   ('Regula Salvatoris', 'The Rule of the Savior', 'A Regra do Salvador'),
   ('Regula Sancti Saluatoris: regula Ordinis Sanctissimi Saluatoris, a Christo Birgittae dictata, cum prologo et declaracione.',
    'The Rule of the Savior, dictated by Christ to Bridget for the monastic order she founded at Vadstena, with its prologue and declaration.',
    'A Regra do Salvador, ditada por Cristo a Brígida para a ordem monástica que fundou em Vadstena, com seu prólogo e sua declaração.'), '1346'),
 'sermo': ('XI', 'sermo-angelicus', 'bridget-sermo-angelicus', ('Sten Eklund', 1972),
   ('Sermo angelicus de excellencia Marie virginis', 'The Angelic Discourse on the Excellence of the Virgin Mary', 'O Sermão Angélico sobre a excelência da Virgem Maria'),
   ('Sermo angelicus: vinti una lecciones ad matutinas hebdomadae sororum Ordinis Saluatoris, ab angelo dictatae de excellencia Mariae.',
    'The Angelic Discourse: twenty-one lessons for the weekly Matins of the Bridgettine sisters, dictated by an angel on the excellence of Mary.',
    'O Sermão Angélico: vinte e uma lições para as matinas semanais das irmãs brigitinas, ditadas por um anjo sobre a excelência de Maria.'), 'c. 1350'),
 'orationes': ('XII', 'quattuor-orationes', 'bridget-quattuor-orationes', ('Sten Eklund', 1991),
   ('Quattuor oraciones', 'The Four Prayers', 'As Quatro Orações'),
   ('Quattuor oraciones a Deo Birgittae reuelatae: laudes Mariae, Christi, membrorum corporis Christi et Virginis.',
    'The Four Prayers revealed by God to Bridget: praises of the Virgin Mary, of Christ, of the members of Christ\'s body and of the Virgin\'s.',
    'As Quatro Orações reveladas por Deus a Brígida: louvores à Virgem Maria, a Cristo e aos membros do corpo de Cristo e da Virgem.'), 'c. 1350-1373'),
}


def trim(t, cap=0):
    return t


def para_md(paras):
    return '\n\n'.join(paras)


def chapter_md(title, rubric, body, h=1):
    out = ['#' * h + ' ' + title, '']
    if rubric:
        out += ['*' + rubric + '*', '']
    out += [para_md(body)] if body else []
    return '\n'.join(out).rstrip() + '\n'


def std_chapters(key):
    pr, ch = P.parse(BOOKS[key][0])
    files = []  # (id, title, markdown)
    if pr:
        files.append(('prologus', 'Prologus', chapter_md('Prologus', '', pr)))
    for i, (label, rubric, body) in enumerate(ch, 1):
        if not body:
            body, _ = P.split_verses(rubric, 1)
            rubric = ''
        files.append(('c%03d' % i, 'Caput ' + label, chapter_md('Caput ' + label, rubric, body)))
    return files


def eight_extra():
    pr, ch = P.parse('XIII')
    parts = ['# Epistola solitarii', '']
    if pr:
        parts += [para_md(pr), '']
    for label, rubric, body in ch:
        if not body:
            body, _ = P.split_verses(rubric, 1)
            rubric = ''
        parts += ['## Caput ' + label, '']
        if rubric:
            parts += ['*' + rubric + '*', '']
        parts += [para_md(body), '']
    return ('epistola-solitarii', 'Epistola solitarii', '\n'.join(parts).rstrip() + '\n')


RUB_X = re.compile(r'^(?:\d+\s*\.?\s*)?(Christus|Domina Birgitta|Narratur|INCIPIT|HIC INCIPIT)')
TAIL_CAPUT = re.compile(r'\s*(?:\d+\s*\.?\s*)?Caput\s+[IVXL]+\s*\.?\s*$')


def stream_chapters(lo, hi, rub_re, titler):
    """Chapters split at rubric lines; verse numbers run on across lines."""
    chapters = []  # [title, rubric parts, body paras]
    n = 1
    for l in P.LINES[lo:hi]:
        if not l.strip() or re.match(r'^[\s*]+$', l):
            continue
        s = P.clean_line(l)
        s = TAIL_CAPUT.sub('', s).strip()
        if not s or re.match(r'^\d*\s*Caput\s+[IVXL]+\s*\.?$', s):
            continue
        if rub_re.match(s):
            s2 = re.sub(r'^\d+\s*\.?\s*', '', s)
            s2 = re.sub(r'\s+\d+$', '', s2)
            rp, n = P.split_verses(s2, n, minlen=10**9)
            s2 = ' '.join(rp)
            if chapters and not chapters[-1][2]:
                chapters[-1][1].append(s2)
            else:
                chapters.append([None, [s2], []])
            continue
        paras, n = P.split_verses(s, n)
        if not chapters:
            chapters.append([None, [], []])
        chapters[-1][2].extend(paras)
    out = []
    for k, (t, rub, body) in enumerate(chapters):
        cid, title = titler(k)
        out.append((cid, title, chapter_md(title, ' '.join(rub), body)))
    return out


def regula_chapters():
    lo, hi = P.book_ranges()['X']
    return stream_chapters(lo, hi, RUB_X, lambda k: ('p%02d' % (k + 1), 'Pars %d' % (k + 1)))


ORD = ['prima', 'secunda', 'tercia', 'quarta']


def orationes_chapters():
    lo, hi = P.book_ranges()['XII']
    rub = re.compile(r'^(?:\d+\s*)?(Prohemium|In ista oracione|In hac oracione|Hec oracio)')

    def titler(k):
        return ('prohemium', 'Prohemium') if k == 0 else ('oracio-%d' % k, 'Oracio %s' % ORD[k - 1])
    return stream_chapters(lo, hi, rub, titler)


def build(key):
    dco, slug, bid, (ed, yr), (nl, ne, np), (dl, de, dp), composed = BOOKS[key]
    if key == 'regula':
        files = regula_chapters()
    elif key == 'orationes':
        files = orationes_chapters()
    else:
        files = std_chapters(key)
    if key == '8':
        files.insert(0, eight_extra())
    d = os.path.join(ROOT, slug)
    os.makedirs(os.path.join(d, 'la'), exist_ok=True)
    os.makedirs(os.path.join(d, 'sources', 'latin-originals'), exist_ok=True)
    for f in os.listdir(os.path.join(d, 'la')):
        os.remove(os.path.join(d, 'la', f))
    for cid, title, md in files:
        open(os.path.join(d, 'la', cid + '.md'), 'w', encoding='utf-8').write(md)
    lo, hi = P.book_ranges()[dco]
    raw = '\n'.join(P.LINES[lo - 1:hi])
    if key == '8':
        lo2, hi2 = P.book_ranges()['XIII']
        raw += '\n\n' + '\n'.join(P.LINES[lo2 - 1:hi2])
    open(os.path.join(d, 'sources', 'latin-originals', slug + '.txt'), 'w', encoding='utf-8').write(raw + '\n')
    def tt(t):
        return {'la': t}
    book = {
        'id': bid, 'cover': 'classic',
        'name': {'la': nl, 'en-US': ne, 'pt-BR': np},
        'author': AUTHOR,
        'description': {'la': dl, 'en-US': de, 'pt-BR': dp},
        'composed': composed,
        'languages': ['la'],
        'work': 'bridget-of-sweden/' + slug,
        'editions': {'la': {'editor': ed + ' (Svenska fornskriftsällskapet critical edition)', 'year': yr}},
        'sources': [{
            'language': 'la', 'url': URL,
            'edition': 'Sancta Birgitta, Revelaciones / Opera minora, Samlingar utgivna av Svenska fornskriftsällskapet, Ser. 2, Latinska skrifter VII, ed. %s (Stockholm, %d).' % (ed, yr),
            'description': 'Word-file transcription distributed by Documenta Catholica Omnia (also circulated as the Riksarkivet CRB texts), book "%s". Cleaned by research/sourcing/_scripts/bridget_build.py: drop-cap braces and stray quotes removed, hyperlink artefacts removed, the edition\'s inline verse numbers dropped (paragraphs break at verse boundaries), chapter rubrics kept in italics under each heading.' % dco,
            'tier': 'B', 'tierEvidence': 'Freely distributed online transcription of a medieval text.'}],
        'toc': [{'id': cid, 'title': tt(title)} for cid, title, md in files],
    }
    json.dump(book, open(os.path.join(d, 'book.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(os.path.join(d, 'book.json'), 'a').write('\n')
    words = sum(len(md.split()) for _, _, md in files)
    print(key, bid, len(files), 'chapters', words, 'words')


if __name__ == '__main__':
    for k in sys.argv[1:]:
        build(k)
