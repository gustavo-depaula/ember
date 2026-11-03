"""Chester 1862 'A Treatise on Prayer and Meditation' (IA treatiseonprayer0000luis) -> en-US book."""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import en_common as E
import esen_lib as B
SRC = B.ROOT + '/research/sourcing/louis-of-granada/ia/treatiseonprayer0000luis.txt'
L = open(SRC, errors='replace').read().replace('\x0c', '').split('\n')
HD = re.compile(r'^\W*\S{0,3}\s*_?\s*CHAPTER[.,]?\s*([IVXLCl]+)[.,]?\W*$')
def rom(s):
    s = s.upper().replace('L', 'I') if False else s.replace('l', 'I').upper()
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50}; t = 0
    for i, c in enumerate(s): t += -v[c] if i + 1 < len(s) and v[c] < v[s[i + 1]] else v[c]
    return t
starts = [(i, rom(HD.match(l).group(1))) for i, l in enumerate(L) if i > 430 and HD.match(l)]
# OCR 'VIL' etc: fix via sequence
seq = []; exp = 1
for i, n in starts:
    if n != exp: n = exp
    seq.append((i, n)); exp += 1
end = next(i for i, l in enumerate(L) if i > seq[-1][0] and l.strip() == 'THE END.')
RH = re.compile(r'ON\s+PRAYER\s+AND\s+MEDITATION|^[\W\d]*$')
def clean(t):
    t = re.sub(r'\s+', ' ', t).strip(); return t
chs = []
for k, (i, n) in enumerate(seq):
    e = seq[k + 1][0] if k + 1 < len(seq) else end
    j = i + 1
    while not L[j].strip(): j += 1
    ti = []
    while L[j].strip(): ti.append(L[j].strip()); j += 1
    title = re.sub(r'\s+', ' ', ' '.join(ti)).strip()
    lead = ''
    m = re.search(r'\s(?=1\.\s*[—-])', title) or re.search(r'(?:night|morning)\.(\s)', title, re.I)
    if m:
        cut = m.start(1) if m.lastindex else m.start()
        title, lead = title[:cut], title[cut:].strip()
    title = re.sub(r'[|>\\]', ' ', title); title = re.sub(r'(\w)-\s+(\w)', r'\1\2', title); title = re.sub(r'\s+', ' ', title).strip(' .:')
    title = title.replace('Orown', 'Crown').replace('OROWN', 'CROWN')
    title = title.title().replace(' And ', ' and ').replace(' Of ', ' of ').replace(' The ', ' the ').replace(' On ', ' on ').replace(' To ', ' to ').replace(' For ', ' for ').replace(' In ', ' in ').replace(' At ', ' at ').replace(' By ', ' by ').replace(' From ', ' from ')
    title = re.sub(r"(['’])S\b", r"\1s", title)
    for a, b in (('Desoent', 'Descent'), ('Resurreotion', 'Resurrection'), ('Appearanoe', 'Appearance'), ('Bell', 'Hell'), ('Orown', 'Crown'), ('Con Sideration', 'Consideration'), ('A More', 'a More'), ('Being A', 'Being a'), ('Is Considered', 'is Considered'), ('Was ', 'Was ')): title = title.replace(a, b)
    title = re.sub(r'\.(?=\w)', '. ', title)
    blocks = []; cur = []
    for l in L[j:e]:
        if l.strip(): cur.append(l)
        elif cur: blocks.append(cur); cur = []
    if cur: blocks.append(cur)
    ps = [clean(lead)] if lead else []
    for b in blocks:
        t = ' '.join(x.strip() for x in b)
        if len(b) <= 2 and (RH.search(t) and len(t) < 70): continue
        if len(t) < 4 and not re.search(r'[a-z]{2}', t): continue
        ps.append(clean(E.join_lines(b)))
    res = []
    for p in ps:
        if res and not re.search(r'[.!?:;"”’\')\]]\s*$', res[-1]) and p[:1].islower(): res[-1] = E.join_lines([res[-1], p])
        else: res.append(p)
    chs.append(('c%02d' % n, 'Chapter %d. %s' % (n, title), '\n\n'.join(res)))
cfg = dict(id='granada-libro-de-la-oracion-chester', dir='louis-of-granada-opera-omnia/libro-de-la-oracion-chester', work='louis-of-granada/libro-de-la-oracion',
           name='A Treatise on Prayer and Meditation (Chester, 1862)', name_pt='Tratado da oração e meditação (Chester, inglês, 1862)',
           author='Louis of Granada', author_es='Fray Luis de Granada', author_pt='Frei Luís de Granada', composed='1554', translator='anonymous, one of the congregation of the Capuchin oratory of St. Francis, Chester', year=1862,
           url='https://archive.org/details/treatiseonprayer0000luis',
           edition='A Treatise on Prayer and Meditation, translated from the Spanish of Fray Luis de Granada, Chester: Griffith, printer, 1862 (in aid of the building fund of the new church of St. Francis, Chester). Internet Archive scan treatiseonprayer0000luis.',
           desc="A Victorian English rendering, in 31 chapters, of Louis of Granada's Libro de la oración y meditación: the fruits of prayer, the six points of its exercise, the fourteen meditations for the mornings and nights of the week and their considerations, and the counsels on devotion. It is condensed and re-divided against the Spanish, so it is its own book.",
           desc_pt='Versão inglesa vitoriana (Chester, 1862) do Libro de la oración y meditación de Luís de Granada, em 31 capítulos.',
           srcdesc='Internet Archive OCR, split at the chapter headings; running heads and page numbers are dropped and line-break hyphens joined. The translator\'s dedication and appeal "To the Purchaser" and the table of contents are not included; isolated recognition slips remain.')
if __name__ == '__main__':
    root = B.write_book(cfg, chs, [SRC])
