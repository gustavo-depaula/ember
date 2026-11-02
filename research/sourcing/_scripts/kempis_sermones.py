import sys; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pair import build
K = 'research/sourcing/kempis/'
build({
 'id': 'kempis-sermones-ad-novicios', 'slug': 'sermones-ad-novicios', 'work': 'sermones-ad-novicios',
 'name': {'la': 'Sermones ad novicios regulares', 'en-US': 'Sermons to the Novices Regular', 'pt-BR': 'Sermões aos noviços regulares'},
 'description': {'la': 'Triginta sermones Thomae a Kempis, magistri novitiorum in monte S. Agnetis, de vita religiosa: de concordia fratrum, de obedientia, humilitate, oratione, tentationibus et aliis. Textus ex editione Pohl (1905).',
   'en-US': 'Thirty conferences given by Thomas as master of novices at Mount St. Agnes, on the religious life: concord among brethren, obedience, humility, prayer, temptation and the rest. The Latin is Pohl\'s critical edition (Freiburg 1905), here from a raw OCR of the printed volume. Scully\'s 1907 English translation (Kegan Paul) is not yet imported.',
   'pt-BR': 'Trinta conferências de Tomás, mestre de noviços no Monte Santa Inês, sobre a vida religiosa: concórdia entre os irmãos, obediência, humildade, oração, tentações e outros temas.'},
 'composed': 'c. 1425-1440',
 'editions': {'la': {'editor': 'Michael Joseph Pohl', 'year': 1905}},
 'sources': [{'language': 'la', 'url': 'https://archive.org/details/thomaehemerkena00pohlgoog', 'edition': 'Thomae Hemerken a Kempis Sermones ad novicios, ed. M. J. Pohl (Freiburg: Herder 1905), Opera omnia VI; archive.org raw OCR (Google scan).',
   'description': 'The thirty sermons in three parts, with Pohl\'s upper-case sermon titles recased (u/v normalised by script). Line numbers, running heads and page breaks stripped by script; Pohl\'s critical footnotes and introduction are not imported. The exempla and the Vita Lidewigis in the same volume are not part of this book. Raw OCR: drop capitals, margin glosses and isolated letters are sometimes garbled.', 'tier': 'A', 'tierEvidence': 'Pohl 1905; Thomas died in 1471.'}],
 'groups': [{'la': 'Pars prima'}, {'la': 'Pars secunda'}, {'la': 'Pars tertia'}],
 'la': {'file': K + 'pohl/thomaehemerkena00pohlgoog.txt', 'start': 395, 'end': 12878, 'marker': r'\bSERMO\b', 'groups': (2803, 7329), 'title_before': True},
})
