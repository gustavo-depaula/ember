import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
import mc_mysteres as M
B = ROOT + 'content/books/marmion-opera-omnia/christ-in-his-mysteries'
bookjson.author_file(ROOT + 'content/authors/marmion.json', 'Bl. Columba Marmion', 'Bem-aventurado Columba Marmion', 20, ['Columba Marmion', 'Marmion, Columba', 'Dom Columba Marmion', 'Bl. Columba Marmion', 'Joseph Marmion'])
make_book(B, 'marmion-christ-in-his-mysteries', 'marmion/christ-in-his-mysteries',
 {'fr-FR': 'Le Christ dans ses mystères', 'en-US': 'Christ in His Mysteries', 'pt-BR': 'Cristo nos seus mistérios'},
 {'fr-FR': 'Bx Columba Marmion', 'en-US': 'Bl. Columba Marmion', 'pt-BR': 'Bem-aventurado Columba Marmion'},
 {'fr-FR': 'Vingt conférences de l’abbé de Maredsous sur les mystères du Christ au long du cycle liturgique : de son sein éternel dans le Père à la Pentecôte, à l’Eucharistie, au Cœur du Christ et à la sainteté de ses élus. Suite de « Le Christ, vie de l’âme », honorée d’une lettre de Benoît XV (1919).',
  'en-US': 'Twenty conferences by the Abbot of Maredsous on the mysteries of Christ through the liturgical cycle: from His eternal state in the bosom of the Father to Pentecost, the Eucharist, the Heart of Christ and the holiness of His saints. Sequel to Christ the Life of the Soul, honoured with a letter from Benedict XV (1919). The English follows the French chapter for chapter.',
  'pt-BR': 'Vinte conferências do abade de Maredsous sobre os mistérios de Cristo ao longo do ciclo litúrgico: do seu estado eterno no seio do Pai até Pentecostes, a Eucaristia, o Coração de Cristo e a santidade dos seus eleitos. Continuação de «Cristo, vida da alma», louvada por uma carta de Bento XV (1919).'},
 '1919', ['fr-FR', 'en-US'],
 {'fr-FR': {'editor': 'Dom Raymond Thibaut (8th ed., Desclée de Brouwer)', 'year': 1922}, 'en-US': {'translator': 'A Nun of Tyburn Convent (from the 10th French edition)', 'year': 1924}},
 [{'language': 'fr-FR', 'url': 'https://archive.org/details/lechristdanssesm00marm', 'edition': 'Le Christ dans ses mystères, 8e éd., Paris/Bruges: Desclée, De Brouwer, 1922 (imprimatur 21 Dec 1921). Internet Archive scan, OCR text.', 'description': 'Foreword to the 1st edition and the twenty conferences, split at the conference summaries. Running heads and page numbers stripped; each page-bottom reference note became a footnote placed at the end of its page (the call numbers in the OCR are unreliable). Papal letters, title pages, appendices and the table of contents are not imported.', 'tier': 'A', 'tierEvidence': 'Marmion died in 1923: public domain in Brazil and the EU; the 1922 edition is public domain in the US.'},
  {'language': 'en-US', 'url': 'https://archive.org/details/christinhismyste0000righ', 'edition': 'Christ in His Mysteries, by a nun of Tyburn Convent from the 10th French edition, London: Sands / St. Louis: Herder, 1924 (imprimatur Bruges 29 Dec 1923). Internet Archive scan, OCR text.', 'description': 'Same chapters as the French. Running heads removed; page-bottom references kept as footnotes at the end of their page.', 'tier': 'A', 'tierEvidence': 'Anonymous translation published 1924: public domain in the US (before 1931) and, as an anonymous work, in Brazil and the EU.'}],
 [(t[0], {'fr-FR': t[1], 'en-US': t[2]}) for t in M.T])
