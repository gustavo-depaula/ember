"""Write book.json for Lombard's Psalm commentary and Pauline Collectanea. usage: lombard_comm_book.py"""
import json, sys
sys.path.insert(0, 'research/sourcing/_scripts')
import bookjson
R = 'content/books/peter-lombard-opera-omnia/'
au = {'la': 'Petrus Lombardus', 'en-US': 'Peter Lombard', 'pt-BR': 'Pedro Lombardo'}
def mk(slug, id_, name, desc, comp, wk, edition, srcs):
    toc = json.load(open(R + slug + '/toc.json'))
    bookjson.write(R + slug, {'id': id_, 'cover': 'classic', 'name': name, 'author': au, 'description': desc,
        'composed': comp, 'languages': ['la'], 'work': 'peter-lombard/' + wk, 'editions': {'la': edition},
        'sources': srcs, 'toc': toc})
mk('in-psalmos', 'lombard-in-psalmos',
   {'la': 'Commentarium in Psalmos (Magna glosatura)', 'en-US': 'Commentary on the Psalms (the Great Gloss)', 'pt-BR': 'Comentário aos Salmos (a Grande Glosa)'},
   {'la': 'Commentarium in totum Psalterium, glossa continua ex sanctorum Patrum sententiis (Hieronymi, Augustini, Cassiodori, Remigii, Haymonis et aliorum) composita; Psalmi I-CL, cum praefatione Magistri et collationibus Richardi Cenomani. Textus ex editione Migne (Patrologia Latina 191, 1854), ex Parisiensi anni 1541.',
    'en-US': 'The Master of the Sentences\' running gloss on the whole Psalter, built from the Fathers (Jerome, Augustine, Cassiodorus, Remigius, Haymo and others) verse by verse, with the glossator\'s own prologue. The Latin is the Migne text (Patrologia Latina 191, 1854), after the Paris edition of 1541 with the Collationes of Richard of Le Mans; the sixteenth-century editors\' prefaces and collations of the Psalter translations are kept. No English translation exists.',
    'pt-BR': 'A glosa contínua do Mestre das Sentenças sobre todo o Saltério, composta de sentenças dos Padres (Jerônimo, Agostinho, Cassiodoro, Remígio, Haimo e outros), versículo por versículo, com seu prólogo.'},
   'c. 1135-1138', 'psalmos',
   {'editor': 'J.-P. Migne (Patrologia Latina 191), after the Paris 1541 edition', 'year': 1854},
   [{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=11455',
     'edition': 'Petri Lombardi Commentarii in Psalmos Davidicos, ed. J.-P. Migne, Patrologia Latina 191 (Paris 1854), cols. 55-1296, after the Paris 1541 edition; TEI XML of the Corpus Corporum (University of Zurich), work 6407, text 11455, from machine-corrected OCR.',
     'description': 'The seven prefatory pieces (the 1541 editor Richard of Le Mans\'s dedicatory letter, prologue, notes on the authorship of the Psalms and on commentaries, Ad lectorem, and Lombard\'s Praefatio), then Psalms I-CL one file each, with the Psalm titles and verse lemmata in bold and Richard\'s Collationes of the translations kept as sections at the end of the psalms that have them. Page and column breaks dropped; Migne\'s inline source references stay in parentheses and the glossed authority sigla in brackets. Psalm CXVIII is divided by Hebrew letter. Italic lemmata are not marked. Machine-corrected OCR; residual slips possible.',
     'tier': 'A', 'tierEvidence': 'Lombard died in 1160; Migne\'s 1854 printing of the 1541 text is public domain.'}])
mk('collectanea-in-paulum', 'lombard-collectanea-in-paulum',
   {'la': 'Collectanea in omnes D. Pauli epistolas', 'en-US': 'Collectanea on All the Epistles of St. Paul', 'pt-BR': 'Coletâneas sobre todas as epístolas de São Paulo'},
   {'la': 'Glossa continua in epistolas Pauli, ex Patrum sententiis collecta (Romani usque ad Hebraeos), cum praefatione Magistri. Textus ex editione Migne (Patrologia Latina 191-192, 1854-55).',
    'en-US': 'Peter Lombard\'s running gloss on the fourteen Pauline epistles, from Romans to Hebrews, gathered verse by verse from Augustine, Ambrosiaster, Jerome, Chrysostom, Haymo and others, with the Master\'s preface. The Latin is the Migne text (Patrologia Latina 191-192, 1854-55). No English translation exists.',
    'pt-BR': 'A glosa contínua do Mestre das Sentenças sobre as catorze epístolas paulinas, de Romanos a Hebreus, colhida dos Padres, versículo por versículo, com seu prefácio.'},
   'c. 1139-1158', 'collectanea-in-paulum',
   {'editor': 'J.-P. Migne (Patrologia Latina 191-192)', 'year': 1855},
   [{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=11454',
     'edition': 'Petri Lombardi Collectanea in omnes D. Pauli epistolas, ed. J.-P. Migne, Patrologia Latina 191 (Romans-2 Corinthians) and 192 (Galatians-Hebrews); TEI XML of the Corpus Corporum (University of Zurich), works 6406 (text 11454) and 6419 (text 11467), from machine-corrected OCR.',
     'description': 'The preface and the fourteen epistles, one file per chapter of the epistle (with the ancient Argumentum where Migne has one; Titus and Philemon as Migne divides them). The Pauline text lemmata run in the commentary as Migne prints them. Page breaks dropped; source references stay in parentheses and authority sigla in brackets. Machine-corrected OCR; residual slips possible.',
     'tier': 'A', 'tierEvidence': 'Lombard died in 1160; Migne\'s printing is public domain.'}])
