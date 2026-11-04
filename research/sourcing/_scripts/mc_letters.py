import sys, os, re, shutil
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/marmion-opera-omnia/english-letters/'
F = 'englishletters1962_djvu.txt'
T = [('foreword', 'Foreword', r'^FOREWORD'), ('introduction', 'Introduction', r'^INTRODUCTION'),
 ('s01-03', 'I–III. To Abbot-Bishop Rudesind Salvado; to Bishop Kirby; to a bishop friend', r'RUDESIND'),
 ('s04-06', 'IV–VI. To an Irish nun; to an Irish Sister of Mercy; to his future abbot', r'^IV\. TO AN IRISH NUN'),
 ('s07-08', 'VII–VIII. To his sisters Flora and Rosie', r'^VII\. TO HIS SISTER FLORA'),
 ('s09', 'IX. To a young priest', r'^IX\. TO A YOUNG PRIEST'),
 ('s10', 'X. To Abbot-Primate Hildebrand de Hemptinne', r'^HILDEBRAND DE HEMPTINNE'),
 ('s11', 'XI. To an unknown correspondent', r'^XI\. TO AN UNKNOWN'),
 ('s12', 'XII. To Dom Gerald van Caloen, Abbot of Olinda', r'^XI\. TO DOM GERALD'),
 ('s13', 'XIII. To Dom Anschar Hoeckelmann, Abbot of Erdington', r'^XII\. TO DOM ANSCHAR'),
 ('s14', 'XIV. To Dom Bede Camm', r'^XIV\. TO DOM BEDE'),
 ('s15', 'XV. To a priest friend of Dublin', r'^XV\. TO'),
 ('s16', 'XVI. To Dom Placid Wolter, Archabbot of Beuron', r'^XVI TO DOM PLACID'),
 ('s17', 'XVII. To a nun', r'^XVII\. TO.A NUN'),
 ('s18', 'XVIII. To a superioress', r'^XVII\. TO A SUPERIORESS'),
 ('s19', 'XIX. To an English superioress', r'^XIX\. TO AN ENGLISH SUPERIORESS'),
 ('s20', 'XX. To an English Benedictine abbess', r'^XX\. TO AN ENGLISH BENEDICTINE'),
 ('s21-23', 'XXI–XXIII. To a young girl; to a teaching sister; to one of his nieces, a nun', r'^XXI\. TO A YOUNG GIRL'),
 ('s24', 'XXIV. To a Benedictine nun of Tyburn Convent', r'^XXIV\. TO'),
 ('s25', 'XXV. To a Benedictine nun of Ventnor', r'^XXV\. TO A BENEDICTINE NUN'),
 ('s26', 'XXVI. To a Dominican sister of Dublin', r'^XXVI\. TO A DOMINICAN'),
 ('s27', 'XXVII. To a nun', r'^XXVI\. TO A NUN'),
 ('s28-29', 'XXVIII–XXIX. To the Poor Clare Colettines of Cork; to a young girl', r'^XXVIII\. TO THE POOR'),
 ('s30', 'XXX. To the mother of a family', r'^XXX LO THE MOTHER'),
 ('s31', 'XXXI. To a Benedictine nun', r'^XXXII\. TO A BENEDICTINE'),
 ('s32', 'XXXII. To an Irish novice', r'^XXXII\. TO AN IRISH NOVICE'),
 ('chronology', 'Chronology', r'^CHRONOLOGY')]
if __name__ == '__main__':
    EN = load(SRC + 'marmion/' + F)
    # skip the contents page: FOREWORD / INTRODUCTION are matched after it
    base = next(i for i, l in enumerate(EN) if l.strip() == 'FOREWORD')
    idx = [base] + split(EN[base:], [t[2] for t in T[1:]])
    idx = [idx[0]] + [base + i for i in idx[1:]]
    end = next((i for i in range(idx[-1] + 1, len(EN)) if re.match(r'\s*(BIBLIOGRAPHY|INDEX)\b', EN[i])), len(EN))
    idx.append(end)
    V = hyphen_vocab(EN)
    os.makedirs(B + 'en-US', exist_ok=True)
    for k, (cid, title, _) in enumerate(T):
        j, freq = chapter(EN[idx[k]:idx[k+1]], V, 'en')
        paras, notes = build_chapter(j, freq, 'en', fix_en, sections=False)
        paras = [x for x in paras if not x.startswith('## ')]
        open(B + f'en-US/{cid}.md', 'w').write(render(title, paras, notes))
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(SRC + 'marmion/' + F, B + 'sources/english-originals/english-letters.txt')
    make_book(B, 'marmion-english-letters', 'marmion/english-letters',
     {'en-US': 'The English Letters of Abbot Marmion', 'pt-BR': 'As cartas inglesas do abade Marmion'},
     {'en-US': 'Bl. Columba Marmion', 'pt-BR': 'Bem-aventurado Columba Marmion'},
     {'en-US': 'The letters Dom Columba Marmion wrote in English (1881-1923), grouped by correspondent: bishops and priests, his sisters, fellow monks and abbots (Salvado, Hildebrand de Hemptinne, van Caloen, Bede Camm, Wolter) and above all nuns and religious superiors, with the editors’ introductions and notes. Edited by Dom Gisbert Ghysens and Dom Thomas Delforge (Helicon, 1962).',
      'pt-BR': 'As cartas que Dom Columba Marmion escreveu em inglês (1881-1923), agrupadas por destinatário: bispos e sacerdotes, suas irmãs, monges e abades (Salvado, Hildebrand de Hemptinne, van Caloen, Bede Camm, Wolter) e sobretudo religiosas e superioras, com as introduções e notas dos editores. Editadas por Dom Gisbert Ghysens e Dom Thomas Delforge (Helicon, 1962).'},
     '1881-1923', ['en-US'], {'en-US': {'editor': 'Dom Gisbert Ghysens and Dom Thomas Delforge, O.S.B.', 'year': 1962}},
     [{'language': 'en-US', 'url': 'https://archive.org/details/englishlettersof00marm', 'edition': 'The English Letters of Abbot Marmion, 1858-1923, edited by Dom Gisbert Ghysens and Dom Thomas Delforge, Baltimore/Dublin: Helicon Press, 1962. Internet Archive scan, OCR text.', 'description': 'Foreword, introduction, the thirty-two sections of letters (some of them run together where the OCR lost the heading), and the chronology. The editors’ notes are left in the text as paragraphs. The bibliography and index are not imported.', 'tier': 'B', 'tierEvidence': 'Marmion’s letters are public domain (died 1923); the editors’ introductions and notes are of 1962 (no renewal found in the NYPL records), imported as freely available.'}],
     [(c, {'en-US': t}) for c, t, _ in T])
