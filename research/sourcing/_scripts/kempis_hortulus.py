import sys; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pair import build
K = 'research/sourcing/kempis/'
SRC_LA = lambda w, d: {'language': 'la', 'url': 'https://archive.org/details/operaomnia0000thom_q8k7', 'edition': 'Thomae Hemerken a Kempis ' + w + ', ed. M. J. Pohl (Freiburg: Herder 1918), Opera omnia IV; archive.org raw OCR (Pohl 1918 volume).',
   'description': d + ' Line numbers, running heads and page breaks stripped by script; Pohl\'s critical footnotes and introduction are not imported. Chapter titles are Pohl\'s upper-case titles recased (u/v normalised by script). Raw OCR: drop capitals at chapter openings and isolated letters are often garbled.', 'tier': 'A', 'tierEvidence': 'Pohl 1918; Thomas died in 1471.'}
SRC_EN = lambda t, u: {'language': 'en-US', 'url': 'https://archive.org/details/littlegardenrose00thom', 'edition': 'The Little Garden of Roses and Valley of Lilies, anonymous English translation (Baltimore: Murphy 1867); archive.org OCR.',
   'description': t + ' The English prints each chapter\'s Latin scripture motto and its translation. Raw OCR with residual slips.', 'tier': 'A', 'tierEvidence': 'Published 1867.'}
ED = {'la': {'editor': 'Michael Joseph Pohl', 'year': 1918}, 'en-US': {'translator': 'anonymous (Murphy, Baltimore)', 'year': 1867}}
build({
 'id': 'kempis-hortulus-rosarum', 'slug': 'hortulus-rosarum', 'work': 'hortulus-rosarum',
 'name': {'la': 'Hortulus rosarum', 'en-US': 'The Little Garden of Roses', 'pt-BR': 'O Pequeno Jardim de Rosas'},
 'description': {'la': 'Hortulus rosarum de valle lacrimarum: duodeviginti capitula de bona societate, de sancta solitudine, de poenitentia, de passione Christi et de caelesti patria. Textus ex editione Pohl (1918), versio Anglica anni 1867.',
   'en-US': 'The first of Thomas\'s two companion garden books, in eighteen short chapters on good company, silence, repentance, the Passion and the heavenly homeland, each opening on a scripture verse. The Latin is Pohl\'s critical edition (Freiburg 1918), from a raw OCR of the printed volume; the English is the anonymous 1867 Baltimore translation.',
   'pt-BR': 'O primeiro dos dois livros-jardim de Tomás, em dezoito capítulos curtos sobre a boa companhia, o silêncio, a penitência, a Paixão e a pátria celeste.'},
 'composed': 'c. 1420-1430', 'editions': ED,
 'sources': [SRC_LA('Hortulus rosarum', 'The eighteen chapters of the Hortulus rosarum.'), SRC_EN('The eighteen chapters of the Hortulus, matched chapter by chapter with the Latin.', '')],
 'groups': [{'la': ''}],
 'la': {'file': K + 'pohl/operaomnia0000thom_q8k7.txt', 'start': 190, 'end': 2150, 'marker': r'CAPITVLVM', 'title_before': True, 'titles': {0: 'De bona societate quaerenda et mala cavenda'}},
 'en': {'file': K + 'en/littlegardenrose00thom.txt', 'start': 876, 'end': 4780, 'marker': r'^\s*CHAP\.\s+[IVXLCYHL1]+', 'caps_title': True},
})
build({
 'id': 'kempis-vallis-liliorum', 'slug': 'vallis-liliorum', 'work': 'vallis-liliorum',
 'name': {'la': 'Vallis liliorum', 'en-US': 'The Valley of Lilies', 'pt-BR': 'O Vale dos Lírios'},
 'description': {'la': 'Vallis liliorum: triginta quattuor capitula de virtutibus, de patientia, humilitate, caritate et vita aeterna. Textus ex editione Pohl (1918), versio Anglica anni 1867.',
   'en-US': 'The second garden book, in thirty-four chapters on the virtues the lily stands for: humility, patience, the tongue, the heart, union with God and the eternal praise of God, each chapter opening on a scripture verse. The Latin is Pohl\'s critical edition (Freiburg 1918), from a raw OCR of the printed volume; the English is the anonymous 1867 Baltimore translation.',
   'pt-BR': 'O segundo livro-jardim de Tomás, em trinta e quatro capítulos sobre as virtudes simbolizadas pelo lírio: humildade, paciência, língua, coração, união com Deus e louvor eterno.'},
 'composed': 'c. 1420-1430', 'editions': ED,
 'sources': [SRC_LA('Vallis liliorum', 'The thirty-four chapters of the Vallis liliorum.'), SRC_EN('The thirty-four chapters of the Vallis, matched chapter by chapter with the Latin.', '')],
 'groups': [{'la': ''}],
 'la': {'file': K + 'pohl/operaomnia0000thom_q8k7.txt', 'start': 2270, 'end': 5565, 'marker': r'CAPITVLVM', 'title_before': True, 'titles': {0: 'De triplici statu vitae humanae'}},
 'en': {'file': K + 'en/littlegardenrose00thom.txt', 'start': 4790, 'end': 10850, 'marker': r'^\s*CHAP\.\s+[IVXLCYHL1]+', 'caps_title': True},
})
