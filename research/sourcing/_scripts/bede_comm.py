import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from bede_common import *
ORDN = {'PRIMUS': 1, 'SECUNDUS': 2, 'TERTIUS': 3, 'QUARTUS': 4, 'QUINTUS': 5, 'SEXTUS': 6, 'SEPTIMUS': 7}
CAPN = {'PRIMUM': 'I'}
LIB = re.compile(r'^(?:INCIPIT\s+)?(?:LIBER|Liber)\s+(PRIMUS|SECUNDUS|TERTIUS|QUARTUS|QUINTUS|SEXTUS|SEPTIMUS|primus|secundus|tertius|quartus|quintus|sextus|septimus)\b.*$')
CAP = re.compile(r'^(?:CAPUT|CAP\.)\s+([IVXLC]+|PRIMUM|\d+)\b\.?\s*(.*)$')
SUB = re.compile(r'^(PRAEFATIO|Praefatio|PROLOGUS|Prologus|PROOEMIUM|EPISTOLA[^\n]*|ARGUMENTUM[^\n]*|EPIGRAMMA[^\n]*|INCIPIT (?:LIBER|EXPOSITIO)\.?|Explicit[^\n]*)\.?\s*(?:AD [A-Z ,]+)?\.?$')
def units(text, restart=False, label='Liber'):
    """text -> list of (title, [md blocks]); units cut at LIBER lines (or at a CAPUT PRIMUM restart)."""
    cur = ('Praefatio', []); out = [cur]; seen_cap = 0; n = 0
    for blk in re.split(r'\n\s*\n', text):
        lines = [l.strip() for l in blk.split('\n') if l.strip()]
        if not lines: continue
        # a block may start with a heading line followed by text lines
        while lines:
            l = lines[0]
            m = LIB.match(l)
            if m:
                n += 1; cur = ('%s %s' % (label, roman(ORDN[m.group(1).upper()])), []); out.append(cur); seen_cap = 0
                lines.pop(0); continue
            m = CAP.match(l)
            if m:
                if restart and m.group(1) == 'PRIMUM' and seen_cap:
                    n += 1; cur = ('Pars %s' % roman(n + 1), []); out.append(cur); seen_cap = 0
                seen_cap += 1
                num = 'I' if m.group(1) == 'PRIMUM' else (roman(int(m.group(1))) if m.group(1).isdigit() else m.group(1))
                cur[1].append('### Caput %s' % num)
                if m.group(2).strip(): cur[1].append('**%s**' % m.group(2).strip().rstrip('.'))
                lines.pop(0); continue
            m = SUB.match(l)
            if m and len(l) < 90:
                cur[1].append('**%s**' % tcase2(l)); lines.pop(0); continue
            break
        if lines:
            cur[1].append(re.sub(r'\s+', ' ', ' '.join(lines)))
    return out
def tcase2(s):
    s = s.rstrip('.').strip()
    if not s.isupper(): return s
    return ' '.join(w.lower() if (w in ('AD', 'DE', 'ET', 'IN') and k) else w[:1] + w[1:].lower() for k, w in enumerate(s.split(' ')))
def build(srcs, restart=False):
    """srcs: list of (ws name, unit title or None). Returns (toc, chapters, rawtext)."""
    toc = []; chs = {}; raw = []
    k = 0
    for name, label in srcs:
        r = read_ws(name); raw.append(r)
        t = clean_ws(r)
        t = re.sub(r'(?m)^.*\(Beda\), J\. P\. Migne\s*$', '', t)
        t = re.sub(r'(?m)^\s*(\(cf\.[^\n]*\)|\'\'\(cf[^\n]*)$', '', t)
        us = units(t, restart)
        # drop an empty preface
        us = [(a, b) for a, b in us if b]
        if len(us) == 1 and us[0][0] == 'Praefatio' and label is None:
            us = [('Expositio', us[0][1])]
        elif us and us[0][0] == 'Praefatio' and all(b.startswith('###') or b.startswith('**') for b in us[0][1]) is False and len(us) > 1:
            pass
        for title, blocks in us:
            if label and len(us) == 1: title = label
            elif label: title = '%s: %s' % (label, title)
            k += 1; cid = 'u%02d' % k
            chs[cid] = '# %s\n\n' % title + '\n\n'.join(blocks)
            toc.append({'id': cid, 'title': {'la': title}})
    return toc, chs, '\n---\n'.join(raw)

BOOKS = [
 ('hexaemeron', 'bede-hexaemeron', 'in-principium-genesis', [('Hexaemeron_Beda_', None)], 'In principium Genesis (Hexaemeron)', 'On Genesis (Hexaemeron)', 'Sobre o Gênesis (Hexaêmeron)', '717-725',
  'Expositio in principium Genesis usque ad natiuitatem Isaac et eiectionem Ismahelis, quattuor libris, ad Accam episcopum Hagustaldensem.',
  "Bede's commentary on Genesis from the creation to the birth of Isaac and the expulsion of Ishmael, in four books dedicated to Bishop Acca of Hexham: the first of his biblical commentaries, patristic in method (Augustine, Basil, Ambrose, Jerome) and allegorical in aim.",
  'O comentário de Beda ao Gênesis, da criação ao nascimento de Isaac e à expulsão de Ismael, em quatro livros dedicados ao bispo Acca de Hexham: o primeiro dos seus comentários bíblicos, patrístico no método e alegórico no propósito.'),
 ('tabernaculo', 'bede-de-tabernaculo', 'de-tabernaculo', [('De_tabernaculo_et_vestibus_sacerdotum', None)], 'De tabernaculo et vestibus sacerdotum', 'On the Tabernacle and the Priestly Vestments', 'Sobre o Tabernáculo e as Vestes dos Sacerdotes', 'c. 721-725',
  'De tabernaculo et vasis eius ac uestibus sacerdotum libri tres.',
  "Bede's three-book allegorical exposition of the tabernacle, its furnishings and the priestly vestments (Exodus 25-28), read as figures of Christ, the Church and the soul.",
  'A exposição alegórica de Beda, em três livros, sobre o tabernáculo, suas alfaias e as vestes sacerdotais (Êxodo 25-28), lidos como figuras de Cristo, da Igreja e da alma.'),
 ('samuel', 'bede-in-primam-partem-samuhelis', 'in-primam-partem-samuhelis', [('Allegorica_expositio_in_Samuelem', None)], 'In primam partem Samuhelis libri IV', 'On the First Part of Samuel', 'Sobre a Primeira Parte de Samuel', 'c. 716-731',
  'Allegorica expositio in primam partem Samuhelis, libri quattuor, usque ad mortem Saulis.',
  "Bede's four-book allegorical commentary on 1 Samuel, from Hannah's prayer to the death of Saul.",
  'O comentário alegórico de Beda, em quatro livros, ao Primeiro Livro de Samuel, da oração de Ana à morte de Saul.'),
 ('templo', 'bede-de-templo', 'de-templo-salomonis', [('De_templo_Salomonis', None)], 'De templo Salomonis', 'On the Temple of Solomon', 'Sobre o Templo de Salomão', 'c. 729-731',
  'De templo Salomonis liber, cum epistola ad Accam.',
  "Bede's exposition of Solomon's Temple (1 Kings 5-8) as the figure of the Church and of each believing soul, with its dedicatory letter to Bishop Acca.",
  'A exposição de Beda sobre o Templo de Salomão (1 Reis 5-8) como figura da Igreja e de cada alma fiel, com a carta dedicatória ao bispo Acca.'),
 ('quaestiones-regum', 'bede-in-regum-librum-xxx-quaestiones', 'in-regum-librum-xxx-quaestiones', [('Quaestiones_in_libros_Regum', None)], 'In Regum librum XXX quaestiones', 'Thirty Questions on the Book of Kings', 'Trinta Questões sobre o Livro dos Reis', 'c. 716-731',
  'Triginta quaestiones in librum Regum, ad Nothelmum presbyterum.',
  "Bede's answers to thirty questions on difficult passages of the Books of Kings, put to him by the priest Nothelm (later Archbishop of Canterbury).",
  'As respostas de Beda a trinta questões sobre passagens difíceis dos Livros dos Reis, propostas pelo presbítero Nothelm (depois arcebispo de Cantuária).'),
 ('proverbios', 'bede-in-proverbia-salomonis', 'in-proverbia-salomonis', [('Allegorica_expositio_in_Parabolas_Salomonis', None), ('De_muliere_forti', 'De muliere forti')], 'In Proverbia Salomonis libri III', 'On the Proverbs of Solomon', 'Sobre os Provérbios de Salomão', 'c. 716-731',
  'Allegorica expositio in Parabolas Salomonis libri tres, cum libello De muliere forti (Prov 31,10-31).',
  "Bede's commentary on the Proverbs of Solomon in three books, with the separate treatise On the Valiant Woman (Prov 31:10-31), read as the Church.",
  'O comentário de Beda aos Provérbios de Salomão, em três livros, com o tratado separado sobre a Mulher Forte (Pr 31,10-31), lida como a Igreja.'),
 ('cantico', 'bede-in-cantica-canticorum', 'in-cantica-canticorum', [('Allegorica_expositio_in_Cantica_canticorum', None)], 'In Cantica canticorum libri VII', 'On the Song of Songs', 'Sobre o Cântico dos Cânticos', 'c. 716-731',
  'Allegorica expositio in Cantica canticorum libri septem.',
  "Bede's seven-book allegorical commentary on the Song of Songs, the Church's voice to Christ: book I answers Julian of Eclanum, book VII is an anthology of Gregory the Great.",
  'O comentário alegórico de Beda ao Cântico dos Cânticos, em sete livros, como voz da Igreja a Cristo: o livro I responde a Juliano de Eclano e o livro VII é uma antologia de Gregório Magno.'),
 ('esdras', 'bede-in-ezram-et-neemiam', 'in-ezram-et-neemiam', [('Allegorica_expositio_in_Esdram_et_Nehemiam', None)], 'In Ezram et Neemiam libri III', 'On Ezra and Nehemiah', 'Sobre Esdras e Neemias', 'c. 725-731',
  'Allegorica expositio in Esdram et Neemiam libri tres.',
  "Bede's three-book allegorical commentary on Ezra and Nehemiah: the return from exile and the rebuilding of Jerusalem as figures of the Church.",
  'O comentário alegórico de Beda, em três livros, a Esdras e Neemias: o retorno do exílio e a reconstrução de Jerusalém como figuras da Igreja.'),
 ('habacuc', 'bede-in-canticum-habacuc', 'in-canticum-habacuc', [('Allegorica_expositio_in_Canticum_Habacuc', None)], 'In Canticum Habacuc', 'On the Canticle of Habakkuk', 'Sobre o Cântico de Habacuc', 'c. 716-731',
  'Allegorica expositio in Canticum Habacuc prophetae.',
  "Bede's short allegorical commentary on the prayer of Habakkuk (Hab 3), sung in the Church's office.",
  'O breve comentário alegórico de Beda à oração de Habacuc (Hab 3), cantada no ofício da Igreja.'),
 ('tobias', 'bede-in-tobiam', 'in-tobiam', [('Allegorica_interpretatio_in_Tobiam', None)], 'In Tobiam', 'On Tobias', 'Sobre Tobias', 'c. 716-731',
  'Allegorica interpretatio in librum Tobiae.',
  "Bede's short allegorical interpretation of the Book of Tobit.",
  'A breve interpretação alegórica de Beda ao Livro de Tobias.'),
 ('marcos', 'bede-in-marci-evangelium', 'in-marci-evangelium', [('In_Evangelium_S._Marci_Beda_', None)], 'In Marci evangelium expositio', 'On the Gospel of Mark', 'Sobre o Evangelho de Marcos', 'c. 725-731',
  'In Marci evangelium expositio libris quattuor, ad Accam.',
  "Bede's four-book exposition of the Gospel of Mark, drawn from Jerome, Augustine, Ambrose and Gregory, dedicated to Bishop Acca.",
  'A exposição de Beda ao Evangelho de Marcos, em quatro livros, colhida em Jerônimo, Agostinho, Ambrósio e Gregório, dedicada ao bispo Acca.'),
 ('lucas', 'bede-in-lucae-evangelium', 'in-lucae-evangelium', [('In_Evangelium_S._Lucae_Beda_', None)], 'In Lucae evangelium expositio', 'On the Gospel of Luke', 'Sobre o Evangelho de Lucas', 'c. 709-716',
  'In Lucae evangelium expositio libris sex, cum epistolis Accae et Bedae.',
  "Bede's six-book exposition of the Gospel of Luke, the longest of his works, with the letters of Bishop Acca urging it and Bede's reply; it was widely copied and is quoted throughout the Catena Aurea.",
  'A exposição de Beda ao Evangelho de Lucas, em seis livros, a mais longa das suas obras, com as cartas do bispo Acca que a pediu e a resposta de Beda; foi muito copiada e é citada ao longo da Catena Aurea.'),
 ('atos', 'bede-in-actus-apostolorum', 'in-actus-apostolorum', [('Expositio_super_Acta_Apostolorum_Beda_', 'Expositio'), ('Retractatio_in_Acta_Apostolorum', 'Retractatio'), ('De_nominibus_locorum', 'De nominibus locorum')], 'In Actus apostolorum expositio, Retractatio, De nominibus locorum', 'On the Acts of the Apostles (with the Retractation and the Names of Places)', 'Sobre os Atos dos Apóstolos (com a Retratação e os Nomes dos Lugares)', 'c. 709-731',
  'Expositio super Acta apostolorum; Retractatio in Actus; De nominibus locorum, quae in Actibus apostolorum leguntur.',
  "Bede's commentary on Acts, his later Retractation (a second reading of the book against the Greek text), and the short list of place-names in Acts.",
  'O comentário de Beda aos Atos, a Retratação posterior (uma segunda leitura do livro à luz do texto grego) e a breve lista dos nomes de lugares nos Atos.'),
 ('catolicas', 'bede-super-epistolas-catholicas', 'super-epistolas-catholicas', [('Super_epistolas_Catholicas', None)], 'Super epistolas catholicas expositio', 'On the Seven Catholic Epistles', 'Sobre as Sete Epístolas Católicas', 'c. 709-716',
  'Super septem epistolas catholicas expositio.',
  "Bede's exposition of the seven Catholic Epistles (James, 1-2 Peter, 1-3 John, Jude).",
  'A exposição de Beda às sete Epístolas Católicas (Tiago, 1-2 Pedro, 1-3 João, Judas).'),
 ('apocalypsis', 'bede-explanatio-apocalypsis', 'explanatio-apocalypsis', [('Explanatio_Apocalypsis', None)], 'Explanatio Apocalypsis', 'Explanation of the Apocalypse', 'Explicação do Apocalipse', 'c. 703-716',
  'Explanatio Apocalypsis libris tribus, cum epistola ad Eusebium (Hwaetberhtum) et epigrammate de Ioanne.',
  "Bede's three-book exposition of the Apocalypse of St. John, written for Abbot Eusebius (Hwaetberht) of Wearmouth-Jarrow, following Primasius and Tyconius and reading the book as the history of the Church.",
  'A exposição de Beda ao Apocalipse de São João, em três livros, escrita para o abade Eusébio (Hwaetberht) de Wearmouth-Jarrow, seguindo Primásio e Ticônio e lendo o livro como história da Igreja.'),
]
if __name__ == '__main__':
    only = sys.argv[1:]
    for key, bid, slug, srcs, la_name, en_name, pt_name, composed, la_d, en_d, pt_d in BOOKS:
        if only and key not in only: continue
        toc, chs, raw = build(srcs, restart=(key == 'catolicas'))
        if key == 'catolicas':
            names = [('Epistola Iacobi', 'Epistle of James'), ('Epistola I Petri', 'First Epistle of Peter'), ('Epistola II Petri', 'Second Epistle of Peter'), ('Epistolae Ioannis et epistola Iudae', 'Epistles of John and Epistle of Jude')]
            for t, (la_t, en_t) in zip(toc, names):
                chs[t['id']] = re.sub(r'^# .*', '# ' + la_t, chs[t['id']], count=1)
                t['title'] = {'la': la_t, 'en-US': en_t}
        for t in toc:
            if 'en-US' in t['title']: continue
            t['title']['en-US'] = t['title']['la'].replace('Liber', 'Book').replace('Caput', 'Chapter').replace('Praefatio', 'Preface').replace('Pars', 'Part').replace('Expositio', 'Exposition').replace('Retractatio', 'Retractation').replace('De nominibus locorum', 'On the Names of Places').replace('De muliere forti', 'On the Valiant Woman')
        book = {
         "id": bid, "cover": "classic",
         "name": {"la": la_name, "en-US": en_name, "pt-BR": pt_name}, "author": bede_author(),
         "description": {"la": la_d, "en-US": en_d + " Latin text of Migne (%s); no public-domain English translation is known." % 'PL 91-93', "pt-BR": pt_d},
         "composed": composed, "languages": ["la"], "work": "bede/" + slug,
         "editions": {"la": {"editor": "Migne, Patrologia Latina 91-93 (1862-1863), after Giles (1843-44)", "year": 1862}},
         "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Scriptor:Beda_Venerabilis",
           "edition": "; ".join(s[0].replace('_', ' ').strip() for s in srcs) + " on Latin Wikisource, from the Corpus Corporum TEI of Migne's Patrologia Latina.",
           "description": "Wikitext removed; inline PL column numbers dropped; one file per book (or per part), chapter divisions kept as headings with their rubrics.",
           "tier": "A", "tierEvidence": "Eighth-century text in Migne's reprint of Giles: public domain."}],
         "arrived": {"la": "2026-11-02"}, "toc": toc}
        d = BD + slug.replace('in-principium-genesis', 'hexaemeron')
        write_book(d, book, {'la': chs}, raw, slug)
        print(key, d.split('/')[-1], len(chs), sum(words(m) for m in chs.values()))
