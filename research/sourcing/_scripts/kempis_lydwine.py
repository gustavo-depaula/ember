import sys; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pair import build
K = 'research/sourcing/kempis/'
build({
 'id': 'kempis-lydwine-scully', 'slug': 'vita-lidewigis-scully', 'work': 'vita-lidewigis',
 'name': {'en-US': 'St. Lydwine of Schiedam', 'pt-BR': 'Santa Lidwina de Schiedam', 'la': 'Vita Lidewigis virginis'},
 'description': {'en-US': 'The life of the paralysed mystic Lydwine of Schiedam (1380-1433), whom Thomas knew of and wrote up from the earlier life by Jan Brugman, in two parts: her sufferings and virtues, and her spiritual consolations, ecstasies and death, with the miracles recorded after it. English only, V. Scully (1912); Pohl\'s Latin (Opera omnia VI) is not yet imported as a separate book.',
   'pt-BR': 'A vida da mística paralítica Lidwina de Schiedam (1380-1433), que Tomás compôs a partir da vida anterior de Jan Brugman, em duas partes: sofrimentos e virtudes; consolações espirituais, êxtases e morte, com os milagres.',
   'la': 'Vita Lidewigis virginis. Versio Anglica tantum.'},
 'composed': 'c. 1433-1450', 'editions': {'en-US': {'translator': 'Vincent Scully', 'year': 1912}},
 'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/stlydwineofschied00thomuoft', 'edition': 'St. Lydwine of Schiedam, by Thomas a Kempis, tr. Vincent Scully (London: Burns & Oates / Edinburgh: Ballantyne 1912), from Pohl\'s text; archive.org OCR.',
   'description': 'The prologue and 23 chapters of Part I and the prologue and 33 chapters of Part II, plus the closing miracles. The translator\'s introduction is not imported. Raw OCR: the translator\'s footnotes stand inline at the end of their paragraphs or pages, and hyphenations at line ends may remain.', 'tier': 'A', 'tierEvidence': 'Published 1912; translator Vincent Scully.'}],
 'groups': [{'en-US': 'Part I: Her sufferings and virtues'}, {'en-US': 'Part II: Her consolations, death and miracles'}],
 'preface': {'en-US': 'Prologue to the Life of Lydwine'},
 'en': {'file': K + 'en/stlydwineofschied00thomuoft.txt', 'start': 1336, 'end': 7218, 'marker': r'^\s*CHAPTER\s+[IVXL]+\s*$', 'caps_title': True, 'groups': (3366,)},
 'extras': [{'id': 'p2-00', 'gi': 1, 'title': 'Prologue to the second part', 'start': 3368, 'end': 3540}],
})
