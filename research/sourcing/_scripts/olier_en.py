import sys, re, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from core import *
import olier_meta as om
from mkbook import make
LE_ = open(ROOT / 'research/sourcing/olier/catechismofanint00olieuoft.txt', encoding='utf-8').read().split('\n')
EL = re.compile(r'^\W{0,3}LESSON\s+([IVXLl1]{1,7})\s*[.,]?\s*$')
HEADS = re.compile(r'^\s*(CATECHISM|OF THE|\d+)\s*[A-Z ,.]*$')
D = om.B / 'catechisme-chretien-1852'
def md(title, lines):
    bl = [b for b in blocks([l for l in lines if not re.fullmatch(r'\s*(CATECHISM\.?|[\dIl|]{1,4}|\$?[a-z]\$?\s*\.?)\s*', l)])]
    bl = [b for b in bl if not (re.match(r'^(LESSON\s+[IVXLl1]+|CONTENTS|Page\b|PART\b)', b) or (len(b) < 220 and re.search(r'\.\s*\d{1,3}\s*$', b) and not b.startswith(('Q.', 'A.'))))]
    bl = [b for b in bl if not (upper_ratio(b) > 0.85 and len(b) < 160)]
    ps = merge(bl)
    return ps
out = []
for part, (a, b) in ((1, (140, 3957)), (2, (3965, len(LE_)))):
    marks = [(i, rom_pieces(EL.match(LE_[i].strip()).group(1))) for i in range(a, b) if EL.match(LE_[i].strip())]
    # keep a chain 1..n
    chain, last = [], 0
    for i, n in marks:
        if n == last + 1 or (n > last and n <= last + 2):
            chain.append((i, n)); last = n
    print(part, len(chain), [n for _, n in chain])
    for k, (i, n) in enumerate(chain):
        j = chain[k + 1][0] if k + 1 < len(chain) else b
        ps = md('', LE_[i + 1:j])
        title = f'Part {part}, lesson {n}'
        if ps and len(ps[0]) < 150 and not ps[0].startswith('Q'):
            title += '. ' + ps[0].rstrip('.'); ps = ps[1:]
        cid = f'p{part}-lecon-{n:02d}'
        out.append((cid, title, write_md(D / 'en-US' / f'{cid}.md', title, ps)))
print(len(out), sum(x[2] for x in out))
name = om.tr('Catéchisme chrétien pour la vie intérieure (traduction anglaise de 1852)', 'Catechism of an Interior Life (1852 English translation)', 'Catecismo cristão para a vida interior (tradução inglesa de 1852)')
desc = om.tr('La traduction anglaise anonyme de 1852 (Baltimore, Murphy) du Catéchisme chrétien d’Olier, en deux parties.', 'The anonymous 1852 English translation (Baltimore: Murphy) of Olier’s Christian Catechism, in two parts.', 'A tradução inglesa anônima de 1852 (Baltimore, Murphy) do Catecismo cristão de Olier, em duas partes.')
src = [{'language': 'en-US', 'url': 'https://archive.org/details/catechismofanint00olieuoft', 'edition': 'A Catechism of an Interior Life, Baltimore: Fielding Lucas / Murphy & Co., 1852 (anonymous translation); archive.org OCR of the Toronto copy.', 'description': 'OCR cleaned: running heads and page numbers removed, hyphenation joined. Lessons whose heading the OCR lost sit inside the previous lesson.', 'tier': 'A', 'tierEvidence': 'Published 1852.'}]
print(make(D, 'olier-catechisme-chretien-1852', 'olier/catechisme-chretien', name, om.AUTH, desc, 1656, {'en-US': {'translator': 'anonymous', 'year': 1852}}, src, langs=('en-US',)))
