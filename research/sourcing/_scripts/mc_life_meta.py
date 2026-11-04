import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
import mc_life as M
make_book(ROOT + 'content/books/marmion-opera-omnia/christ-life-of-the-soul', 'marmion-christ-life-of-the-soul', 'marmion/christ-vie-de-lame',
 {'en-US': 'Christ, the Life of the Soul', 'pt-BR': 'Cristo, vida da alma'},
 {'en-US': 'Bl. Columba Marmion', 'pt-BR': 'Bem-aventurado Columba Marmion'},
 {'en-US': 'Spiritual conferences by the Abbot of Maredsous on the divine plan of adoption in Christ: Christ the model, redeemer and source of all grace, the Church and the Holy Spirit (Part I), then faith, baptism, penance, growth in grace, the Eucharist, the divine praise, prayer, charity, devotion to Our Lady and the heavenly inheritance (Part II). First of the trilogy (Le Christ, vie de l’âme, 1917), with the prefaces of Cardinals Mercier and Bourne. English only: no open French text exists.',
  'pt-BR': 'Conferências espirituais do abade de Maredsous sobre o plano divino da adoção em Cristo: Cristo modelo, redentor e fonte de toda graça, a Igreja e o Espírito Santo (I parte), depois a fé, o batismo, a penitência, o crescimento na graça, a Eucaristia, o louvor divino, a oração, a caridade, a devoção a Nossa Senhora e a herança celeste (II parte). Primeiro da trilogia (Le Christ, vie de l’âme, 1917).'},
 '1917', ['en-US'],
 {'en-US': {'translator': 'A Nun of Tyburn Convent', 'year': 1922}},
 [{'language': 'en-US', 'url': 'https://archive.org/details/christlifeofsoul0000marm', 'edition': 'Christ the Life of the Soul, spiritual conferences, London/Edinburgh: Sands / St. Louis: Herder, 1922 (imprimatur Bruges 25 Jan 1922). Internet Archive scan, OCR text.', 'description': 'The two prefaces and the nineteen conferences. Running heads stripped; the reference notes at the foot of each page are footnotes placed at the end of the page. The Pope’s letter, front matter, contents and index are not imported. The French original (Desclée, 1917) has no open text.', 'tier': 'A', 'tierEvidence': 'Anonymous translation published 1922: public domain in the US (before 1931), Brazil and the EU; Marmion died 1923.'}],
 [(c, {'en-US': t}) for c, t in M.T])
