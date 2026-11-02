import sys; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pair import build
K = 'research/sourcing/kempis/'
G = [{'la': 'Tractatus prior, pars prior: De vita et beneficiis Salvatoris', 'en-US': 'Treatise I, Part I: The life and benefits of the Saviour'},
     {'la': 'Tractatus prior, pars altera: De passione Christi', 'en-US': 'Treatise I, Part II: The Passion of Christ'},
     {'la': 'Tractatus alter, pars prior: De resurrectione, ascensione et sanctis', 'en-US': 'Treatise II, Part I: The Resurrection, Ascension and the saints'},
     {'la': 'Tractatus alter, pars altera: De Eucharistia et aliis', 'en-US': 'Treatise II, Part II: The Eucharist and other devotions'}]
build({
 'id': 'kempis-orationes-de-vita-christi', 'slug': 'orationes-de-vita-christi', 'work': 'orationes-et-meditationes-de-vita-christi',
 'name': {'la': 'Orationes et meditationes de vita Christi', 'en-US': 'Prayers and Meditations on the Life of Christ', 'pt-BR': 'Orações e meditações sobre a vida de Cristo'},
 'description': {'la': 'Duo tractatus: devotae meditationes de vita et beneficiis Salvatoris et de passione, deinde de resurrectione, ascensione, Spiritu Sancto, Eucharistia et sanctis, cum gratiarum actione. Textus ex editione Pohl (1902), versio Anglica W. Duthoit (1904).',
   'en-US': 'Thomas\'s great cycle of thanksgivings and meditations on the whole life of Christ, from the creation of man to the sending of the Spirit, with the long meditations on the Passion, in two treatises of four parts. The Latin is Michael Joseph Pohl\'s critical edition (Freiburg 1902), here from a raw OCR of the printed volume; the English is W. Duthoit\'s translation from the same text (Kegan Paul 1904).',
   'pt-BR': 'O grande ciclo de ações de graças e meditações de Tomás sobre toda a vida de Cristo, da criação do homem ao envio do Espírito, com as longas meditações sobre a Paixão, em dois tratados.'},
 'composed': 'c. 1420-1450',
 'editions': {'la': {'editor': 'Michael Joseph Pohl', 'year': 1902}, 'en-US': {'translator': 'W. Duthoit', 'year': 1904}},
 'sources': [
  {'language': 'la', 'url': 'https://archive.org/details/orationesetmedit0000unse', 'edition': 'Thomae Hemerken a Kempis Orationes et meditationes de vita Christi, ed. M. J. Pohl (Freiburg: Herder 1902), Opera omnia V; archive.org raw OCR (Boston Public Library scan).',
   'description': 'Praefatio and 87 chapters in four parts. Line numbers, running heads and page breaks stripped by script; Pohl\'s critical footnotes and introduction are not imported. Raw OCR: drop capitals at chapter openings are sometimes garbled, and isolated letter confusions remain.', 'tier': 'A', 'tierEvidence': 'Pohl 1902; Thomas died in 1471.'},
  {'language': 'en-US', 'url': 'https://archive.org/details/prayersandmedita00thomuoft', 'edition': 'Prayers and Meditations on the Life of Christ, tr. W. Duthoit (London: Kegan Paul, Trench, Trubner 1904, 1908), from Pohl\'s text; archive.org OCR.',
   'description': 'The 87 chapters in the same four parts as the Latin; the translator\'s introduction is not imported. Raw OCR with residual slips.', 'tier': 'A', 'tierEvidence': 'Published 1904; translator W. Duthoit.'}],
 'groups': G, 'preface': {'la': 'Praefatio', 'en-US': 'Preface'},
 'la': {'file': K + 'pohl/orationesetmedit0000unse.txt', 'start': 486, 'end': 15374, 'marker': r'CAPITVLVM', 'groups': (2761, 9595, 14244)},
 'en': {'file': K + 'en/prayersandmedita00thomuoft.txt', 'start': 1140, 'end': 14829, 'marker': r'^\s*CHAPTER\s+[IVXLC1l]+', 'groups': (3226, 9347, 13815)},
})
