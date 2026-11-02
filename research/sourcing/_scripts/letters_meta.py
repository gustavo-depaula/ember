import json, shutil, sys
from pathlib import Path
which = sys.argv[1]
toc = json.load(open('/tmp/ccx/%s_toc.json' % which))
A = {'anselm': {'la': 'Anselmus Cantuariensis', 'en-US': 'St. Anselm of Canterbury', 'pt-BR': 'Santo Anselmo de Cantuária'},
     'bernard': {'la': 'Bernardus Claraevallensis', 'en-US': 'St. Bernard of Clairvaux', 'pt-BR': 'São Bernardo de Claraval'}}[which]
if which == 'anselm':
    meta = dict(id='anselm-epistolae', cover='classic', name={'la': 'Epistolae (libri I-II)', 'en-US': 'Letters (Books I-II)', 'pt-BR': 'Cartas (livros I-II)'},
      description={'la': 'Epistolae Anselmi: liber primus (nondum abbatis) et liber secundus (abbatis Beccensis), CXXX epistolae. Textus ex editione Migne (Patrologia Latina 158, 1853), secundum Gerberonem.',
                   'en-US': 'The first two books of Anselm’s letters in the Gerberon–Migne order: those of the monk and prior of Bec, and those of the abbot of Bec, 130 letters in all, each headed with its addressee and Gerberon’s summary. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR. Books III and IV (the letters of the archbishop, in Patrologia Latina 159) are not included: no clean transcription of them is available.',
                   'pt-BR': 'Os dois primeiros livros das cartas de Anselmo, na ordem de Gerberon e Migne: as do monge e prior do Bec e as do abade do Bec, ao todo 130 cartas.'},
      composed='1060-1092', work='anselm/epistolae', editions={'la': {'editor': 'J.-P. Migne (Patrologia Latina 158)', 'year': 1853}},
      sources=[{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=10620',
        'edition': 'S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), Epistolae, libri I-II; TEI XML of the Corpus Corporum (University of Zurich), text 10620, from the Open Greek and Latin machine-corrected OCR.',
        'description': 'All 130 letters of books I and II with their salutations and Gerberon’s summaries (set in italics). PL page breaks, columns and the apparatus of variants are dropped. Book III and IV (PL 159) are missing from the Corpus Corporum.',
        'tier': 'A', 'tierEvidence': 'Anselm died in 1109; Migne’s 1853 printing is public domain everywhere.'}])
else:
    meta = dict(id='bernard-epistolae', cover='classic', name={'la': 'Epistolae', 'en-US': 'Letters', 'pt-BR': 'Cartas'},
      description={'la': 'Epistolae S. Bernardi, CDLX, ordine Mabillonii, cum epistolis ad eum scriptis quae inter eas typis expressae sunt. Textus ex editione Migne (Patrologia Latina 182, 1854).',
                   'en-US': 'The 460 letters of Bernard of Clairvaux in Mabillon’s numbering, as printed in the Maurist text of Migne (Patrologia Latina 182, 1854): to popes, kings, bishops, monks and friends, each headed with its addressee and Mabillon’s summary, with a few letters to Bernard (Peter the Venerable’s reply, Eugene III’s letter to the Cistercian chapter) that Mabillon prints among them. Latin only, from a machine-corrected OCR. Letters 42 (On the conduct and office of bishops), 77 (On baptism) and 190 (Against the errors of Abelard) are the treatises Mabillon moved to the second tome; they are given here as letters.',
                   'pt-BR': 'As 460 cartas de Bernardo de Claraval, na numeração de Mabillon, a monges, bispos, papas, reis e amigos.'},
      composed='1115-1153', work='bernard/epistolae', editions={'la': {'editor': 'Jean Mabillon, in J.-P. Migne (Patrologia Latina 182)', 'year': 1854}},
      sources=[{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=21392',
        'edition': 'S. Bernardi Claraevallensis abbatis opera omnia, ed. J. Mabillon, in Migne, Patrologia Latina 182 (Paris 1854), Epistolae; TEI XML of the Corpus Corporum (University of Zurich), text 21392, from machine-corrected OCR.',
        'description': 'All letters I-CDLX with their summaries (in italics) and Mabillon’s monita. PL page breaks, columns and the paragraph numbers are dropped. Where the printed numeral repeats a number and skips the next (the second CXX and CCXXI), the skipped number is restored (CXXI, CCXXIX).',
        'tier': 'A', 'tierEvidence': 'Bernard died in 1153; Migne’s 1854 printing is public domain everywhere.'}])
meta.update(author=A, languages=['la'], toc=toc)
Path('content/books/%s-opera-omnia/epistolae/book.json' % which).write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
d = Path('content/books/%s-opera-omnia/epistolae/sources/latin-originals' % which); d.mkdir(parents=True, exist_ok=True)
shutil.copy('research/sourcing/%s/cc/%s' % ({'anselm': 'anselm', 'bernard': 'bernard-of-clairvaux'}[which], {'anselm': 'anselm-epist.xml', 'bernard': 'epistolae.xml'}[which]), d / 'epistolae.xml')
